import { Response } from "express";
import prisma from "../utils/prismaClient";
import { AuthRequest } from "../middlewares/auth";


export const getAllEmployees = async (_req: AuthRequest, res: Response) => {
    try {
        const employees = await prisma.employee.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                department: true,
                joiningDate: true,
                defaultAnnualDays: true, 
                createdAt: true,
                user: { select: { id: true, email: true, role: true } },
                leaves: true
            }
        });

        if (!employees.length) {
            return res.status(200).json({ message: "No employees found", employees: [] });
        }

        res.json(employees);
    } catch (err) {
        console.error("Error fetching employees:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getEmployeeById = async (req: AuthRequest, res: Response) => {
    try {
        const employeeId = parseInt(req.params.id);
        if (isNaN(employeeId)) {
            return res.status(400).json({ error: "Invalid employee ID" });
        }

        if (req.user?.role !== "ADMIN" && req.user?.employeeId !== employeeId) {
            return res.status(403).json({ error: "Forbidden — You cannot access this employee" });
        }

        const employee = await prisma.employee.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                department: true,
                joiningDate: true,
                defaultAnnualDays: true, 
                createdAt: true,
                user: { select: { id: true, email: true, role: true } },
                leaves: true
            }
        });

        if (!employee) {
            return res.status(404).json({ error: "Employee not found" });
        }

        res.json(employee);
    } catch (err) {
        console.error("Error fetching employee:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const updateEmployee = async (req: AuthRequest, res: Response) => {
    try {
        const employeeId = parseInt(req.params.id);
        if (isNaN(employeeId)) {
            return res.status(400).json({ error: "Invalid employee ID" });
        }

        const { name, email, department, joiningDate, defaultAnnualDays } = req.body;

        const updated = await prisma.employee.update({
            where: { id: employeeId },
            data: {
                name,
                email,
                department,
                joiningDate: joiningDate ? new Date(joiningDate) : undefined,
                defaultAnnualDays,
            },
        });

        res.json({ message: "Employee updated successfully", employee: updated });
    } catch (err: any) {
        if (err.code === "P2025") {
            return res.status(404).json({ error: "Employee not found" });
        }
        if (err.code === "P2002") {
            return res.status(409).json({ error: "Email already exists" });
        }
        console.error("Error updating employee:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const deleteEmployee = async (req: AuthRequest, res: Response) => {
    try {
        const employeeId = parseInt(req.params.id);
        if (isNaN(employeeId)) {
            return res.status(400).json({ error: "Invalid employee ID" });
        }

        await prisma.employee.delete({
            where: { id: employeeId },
        });

        res.json({ message: "Employee deleted successfully" });
    } catch (err: any) {
        if (err.code === "P2025") {
            return res.status(404).json({ error: "Employee not found" });
        }
        console.error("Error deleting employee:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};
