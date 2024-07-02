import pg from 'pg';
import express from 'express';

const { Client } = pg;
const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;
const DATABASE_URL = process.env.DATABASE_URL || 'postgres://localhost:5173/acme_hr_directory';
const client = new Client(DATABASE_URL);



app.get('/api/employees', async (request, response) => {
    try {
        const { rows } = await client.query(`
            SELECT * FROM employees;
          `);

        response.send({
            employees: rows,
        });

    } catch (e) {
        console.error('Failed to GET Employees!');
        console.error(e);
    };
});


app.get('/api/departments', async (request, response) => {
    try {
        const { rows } = await client.query(`
            SELECT * FROM department;
          `);

        response.send({
            department: rows,
        });

    } catch (e) {
        console.error('Failed to get Departments!');
        console.error(e);
    };
});


app.post('/api/employees', async (request, response) => {
    const { employees } = request.body;

    try {


        await client.query(`
            INSERT INTO employees (name) VALUE ($1);
            `, [employees.name]);

        response.status(201).send({
            messsage: `Employee with name ${employees.name} created Succesfully`,
        });

    } catch (e) {
        console.error('Failed to create Employee!');
        console.error(e);
    };
});


app.delete('/api/employees/:id', async (request, response) => {
    const { id } = request.params;

    try {

        await client.query(`
            DELETE FROM acme_hr_directory WHERE id = $1;
            `, [id])

        response.status(204).send({
            message: `Successfully Deleted Employee ID ${id}`,
        });
    } catch (e) {
        console.error('Failed to Delete Employee!');
        console.error(e);
    }
})


app.put('/api/employees/:id', async (request, response) => {
    const { id } = request.params;
    const { name } = request.body;

    try {
        await client.query(`
            UPDATE acme_hr_directory
            SET name = $1,
            WHERE id = $2
        `, [name, id]);

        response.send({
            message: `Successfully Updated Employee!`
        });

    } catch (e) {
        console.error('Failed to Updated Employee!');
        console.error(e);
    }

})


const createDB = async () => {
    try {
        await client.connect();

        await client.query(`
            DROP TABLE IF EXIST employees;
            DROP TABLE IF EXIST department;
            CREATE TABLE IF NOT EXIST department (
                id SERIAL PRIMARY KEY, 
                name VARCHAR(255) NOT NULL
            );
            CREATE TABLE IF NOT EXIST employees (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                created_at TIMESTAMP,
                updated_at TIMESTAMP,
                department_id INTEGER REFERENCES employees(id) NOT NULL
            );
         `);

        app.listen(PORT, () => {
            console.log(`SERVER is listening to PORT ${PORT}`);
        });

    } catch (e) {
        console.error('Failed to Create Database!')
        console.error(e);
    }
};

createDB();

