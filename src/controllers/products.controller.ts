import { Request, Response } from 'express';
import pool from '../conf/dbConnection';

const isValidId = (id: string): boolean => {
    const num = Number(id);
    return Number.isInteger(num) && num > 0;
};

const isValidPrice = (price: any): boolean => {
    const num = Number(price);
    return !isNaN(num) && num > 0;
};

export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const [rows] = await pool.query('SELECT * FROM products WHERE active = TRUE');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    if (!isValidId(id)) {
        res.status(400).json({ error: 'ID must be a positive integer' });
        return;
    }
    try {
        const [rows]: any = await pool.query('SELECT * FROM products WHERE id = ? AND active = TRUE', [id]);
        if (rows.length === 0) {
            res.status(404).json({ error: 'Product not found or inactive' });
            return;
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
    const { name, price, stock, description, brand, img } = req.body;
    if (!name || price === undefined || stock === undefined || !description) {
        res.status(400).json({ error: 'Missing required fields (name, price, stock, description)' });
        return;
    }
    if (!isValidPrice(price)) {
        res.status(400).json({ error: 'Price must be a number greater than zero' });
        return;
    }
    try {
        const [result]: any = await pool.query(
            'INSERT INTO products (name, price, stock, description, brand, img) VALUES (?, ?, ?, ?, ?, ?)', 
            [name, price, stock, description, brand || null, img || null]
        );
        res.status(201).json({ message: 'Product created successfully', id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { name, price, stock, description, brand, img } = req.body;
    if (!isValidId(id)) {
        res.status(400).json({ error: 'ID must be a positive integer' }); return;
    }
    if (!isValidPrice(price)) {
        res.status(400).json({ error: 'Price must be a number greater than zero' }); return;
    }
    try {
        const [result]: any = await pool.query(
            'UPDATE products SET name = ?, price = ?, stock = ?, description = ?, brand = ?, img = ? WHERE id = ? AND active = TRUE',
            [name, price, stock, description, brand, img, id]
        );
        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Product not found or inactive' }); return;
        }
        res.json({ message: 'Product updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    if (!isValidId(id)) {
        res.status(400).json({ error: 'ID must be a positive integer' }); return;
    }
    try {
        const [result]: any = await pool.query('UPDATE products SET active = FALSE WHERE id = ? AND active = TRUE', [id]);
        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Product not found or already inactive' }); return;
        }
        res.json({ message: 'Product logically deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const changePrice = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { price } = req.body;
    if (!isValidId(id)) {
        res.status(400).json({ error: 'ID must be a positive integer' }); return;
    }
    if (!isValidPrice(price)) {
        res.status(400).json({ error: 'Price must be a number greater than zero' }); return;
    }
    try {
        const [result]: any = await pool.query('UPDATE products SET price = ? WHERE id = ? AND active = TRUE', [price, id]);
        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Product not found or inactive' }); return;
        }
        res.json({ message: 'Price updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};