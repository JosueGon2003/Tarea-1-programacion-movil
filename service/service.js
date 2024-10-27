const express = require('express');
const { Pool } = require('pg');
const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
const cors = require('cors');
app.use(cors());

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'barbershop',
    password: 'admin',
    port: 5432,
});

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/productos', async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT pro_id, pro_nombre, pro_descripcion, pro_ruta, pro_estado, pro_precio, pro_stock 
      FROM public.productos 
      ORDER BY pro_id ASC
    `);
        res.json(result.rows);
    } catch (err) {
        console.error('Error al obtener los productos', err);
        res.status(500).send('Error al obtener los productos');
    }
});

app.post('/reducir-stock', async (req, res) => {
    const productos = req.body;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        for (const producto of productos) {
            const { pro_id, cantidad } = producto;

            const result = await client.query('SELECT pro_stock FROM productos WHERE pro_id = $1', [pro_id]);
            const stockActual = result.rows[0].stock;

            if (stockActual < cantidad) {
                return res.status(400).json({ error: `No hay suficiente stock para el producto con ID ${pro_id}` });
            }

            await client.query('UPDATE productos SET pro_stock = pro_stock - $1 WHERE pro_id = $2', [cantidad, pro_id]);
        }

        await client.query('COMMIT');
        res.status(200).json({ message: 'Stock actualizado correctamente.' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
        res.status(500).json({ error: 'Error al reducir el stock.' });
    } finally {
        client.release();
    }
});

app.post('/login', async (req, res) => {
    const { user_cedula, user_contrasenia } = req.body;
    console.log('Cédula:', user_cedula, 'Contraseña:', user_contrasenia);

    if (!user_cedula || !user_contrasenia) {
        return res.status(400).json({ error: 'Cédula y contraseña son requeridas.' });
    }

    try {
        const result = await pool.query('SELECT * FROM public.usuario WHERE user_cedula = $1', [user_cedula]);
        console.log('Resultado de la consulta:', result.rows);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        if (user.user_contrasenia !== user_contrasenia) {
            console.log('Contraseña incorrecta.');
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        res.status(200).json({ message: 'Inicio de sesión exitoso.', user });
    } catch (error) {
        console.error('Error al consultar la base de datos:', error);
        res.status(500).json({ error: 'Error al iniciar sesión.' });
    }
});

app.post('/agregar-stock/:id', async (req, res) => {
    const productId = req.params.id;
    const { cantidad } = req.body;

    if (!cantidad || isNaN(cantidad) || cantidad <= 0) {
        return res.status(400).json({ success: false, message: 'Cantidad inválida.' });
    }

    try {
        const result = await pool.query(
            'UPDATE productos SET pro_stock = pro_stock + $1 WHERE pro_id = $2 RETURNING *',
            [cantidad, productId]
        );

        if (result.rowCount > 0) {
            res.json({ success: true, message: `Se agregaron ${cantidad} unidades al stock del producto.` });
        } else {
            res.status(404).json({ success: false, message: 'Producto no encontrado.' });
        }
    } catch (error) {
        console.error('Error al actualizar el stock:', error);
        res.status(500).json({ success: false, message: 'Error al agregar stock.' });
    }
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
