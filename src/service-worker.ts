/// <reference lib="webworker" />

const CACHE_NAME: string = 'aidiligencepro-v1';
const STATIC_ASSETS: string[] = [
    '/',
    '/index.html',
    '/manifest.json',
    '/favicon.ico',
    '/assets/index.css',
    '/assets/index.js',
];

// Install event - cache static assets
self.addEventListener('install', (event: ExtendableEvent) => {
    event.waitUntil(caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(STATIC_ASSETS);
    }));
});

// Activate event - clean up old caches
self.addEventListener('activate', (event: ExtendableEvent) => {
    event.waitUntil(caches.keys().then((cacheNames: string[]) => {
        return Promise.all(cacheNames
            .filter((name: string) => name !== CACHE_NAME)
            .map((name: string) => caches.delete(name)));
    }));
});

// Fetch event - handle requests
self.addEventListener('fetch', (event: FetchEvent) => {
    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }
    // Handle API requests
    if (event.request.url.includes('/api/')) {
        event.respondWith(fetch(event.request)
            .catch(() => {
                // Return cached response if offline
                return caches.match(event.request);
            }));
        return;
    }
    // Handle static assets
    event.respondWith(caches.match(event.request).then((response: Response | undefined) => {
        // Return cached response if found
        if (response) {
            return response;
        }
        // Clone the request because it can only be used once
        const fetchRequest = event.request.clone();
        // Make network request and cache the response
        return fetch(fetchRequest).then((response: Response) => {
            // Check if response is valid
            if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
            }
            // Clone the response because it can only be used once
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
            });
            return response;
        });
    }));
});

// Background sync for offline form submissions
self.addEventListener('sync', (event: SyncEvent) => {
    if (event.tag === 'sync-reports') {
        event.waitUntil(syncReports());
    }
});

// Push notification handling
self.addEventListener('push', (event: PushEvent) => {
    const options: NotificationOptions = {
        body: event.data?.text() || 'New notification',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'View Details',
            },
            {
                action: 'close',
                title: 'Close',
            },
        ],
    };
    event.waitUntil(self.registration.showNotification('AI Diligence Pro', options));
});

// Notification click handling
self.addEventListener('notificationclick', (event: NotificationEvent) => {
    event.notification.close();
    if (event.action === 'explore') {
        event.waitUntil(clients.openWindow('/reports'));
    }
});

// Helper function to sync reports
async function syncReports(): Promise<void> {
    const db: IDBDatabase = await openIndexedDB();
    const reports: any[] = await db.getAll('offlineReports'); // Ideally, define a type for reports
    for (const report of reports) {
        try {
            await fetch('/api/reports', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(report),
            });
            await db.delete('offlineReports', report.id);
        } catch (error) {
            console.error('Failed to sync report:', error);
        }
    }
}

// IndexedDB setup for offline storage
function openIndexedDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request: IDBOpenDBRequest = indexedDB.open('aidiligencepro-db', 1);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result as IDBDatabase);
        request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
            const db: IDBDatabase = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains('offlineReports')) {
                db.createObjectStore('offlineReports', { keyPath: 'id' });
            }
        };
    });
}

export {};
