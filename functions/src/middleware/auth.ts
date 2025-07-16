import { Request } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { Response } from 'express';

export const requireAuth = async (req: Request, res: Response, next: Function) => {
    const idToken = req.headers.authorization?.split('Bearer ')[1];
    if (!idToken) {
        res.status(401).send('Unauthorized');
        return;
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        (req as any).user = decodedToken;
        next();
    } catch (error) {
        res.status(401).send('Unauthorized');
    }
};

export const hasRole = (roles: string[]) => {
    return async (req: Request, res: Response, next: Function) => {
        const user = (req as any).user;
        if (!user) {
            res.status(401).send('Unauthorized');
            return;
        }

        const userRecord = await admin.auth().getUser(user.uid);
        const userRoles = userRecord.customClaims?.roles || [];

        if (roles.some(role => userRoles.includes(role))) {
            next();
        } else {
            res.status(403).send('Forbidden');
        }
    };
};
