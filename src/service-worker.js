/// <reference lib="webworker" />
const CACHE_NAME = 'aidiligencepro-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/favicon.ico',
    '/assets/index.css',
    '/assets/index.js',
];
// Install event - cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(STATIC_ASSETS);
    }));
});
// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(caches.keys().then((cacheNames) => {
        return Promise.all(cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name)));
    }));
});
// Fetch event - handle requests
self.addEventListener('fetch', (event) => {
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
    event.respondWith(caches.match(event.request).then((response) => {
        // Return cached response if found
        if (response) {
            return response;
        }
        // Clone the request because it can only be used once
        const fetchRequest = event.request.clone();
        // Make network request and cache the response
        return fetch(fetchRequest).then((response) => {
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
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-reports') {
        event.waitUntil(syncReports());
    }
});
// Push notification handling
self.addEventListener('push', (event) => {
    const options = {
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
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    if (event.action === 'explore') {
        event.waitUntil(clients.openWindow('/reports'));
    }
});
// Helper function to sync reports
async function syncReports() {
    const db = await openIndexedDB();
    const reports = await db.getAll('offlineReports');
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
        }
        catch (error) {
            console.error('Failed to sync report:', error);
        }
    }
}
// IndexedDB setup for offline storage
function openIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('aidiligencepro-db', 1);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('offlineReports')) {
                db.createObjectStore('offlineReports', { keyPath: 'id' });
            }
        };
    });
}
export {};
