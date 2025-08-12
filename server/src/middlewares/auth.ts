import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthUser{
    id: number;
    email: string;
    role: "ADMIN" | "EMPLOYEE";
    employeeId?: number;
    defaultAnnualDays?: number;
}

export interface AuthRequest extends Request{
    user?: AuthUser;
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as AuthUser;
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== "ADMIN") {
        return res.status(403).json({ error: "Forbidden — Admins only" });
    }
    next();
};