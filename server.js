require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// PostgreSQL Connection (Neon)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Ensures SSL connection for Neon
});

// Handle Survey Submission
app.post('/submit-survey', async (req, res) => {
    try {
        // ✅ Debugging: Log full form submission data
        console.log("Full form submission received:", req.body);

        const {
            driver_type,
            pay_as_described,
            short_check,
            short_check_details,
            paid_miles_match,
            paid_deadhead,
            paid_detention,
            escrow_deduction,
            escrow_amount,
            escrow_refund,
            recovery_attempts,
            pay_misrepresentation,
            weekly_deductions_clear,
            forced_return_truck,
            contract_ended_without_cause,
            contract_ended_hos_violation,
            contract_ended_payoff_date,
            fuel_surcharge_paid,
            rate_confirmations,
            fuel_discount
        } = req.body;

        if (!driver_type) {
            console.error("Error: Driver type is missing");
            return res.status(400).json({ error: "Driver type is required." });
        }

        const query = `
            INSERT INTO survey_responses (
                driver_type, pay_as_described, short_check, short_check_details,
                paid_miles_match, paid_deadhead, paid_detention, escrow_deduction,
                escrow_amount, escrow_refund, recovery_attempts, pay_misrepresentation,
                weekly_deductions_clear, forced_return_truck, contract_ended_without_cause,
                contract_ended_hos_violation, contract_ended_payoff_date,
                fuel_surcharge_paid, rate_confirmations, fuel_discount
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,
                $13, $14, $15, $16, $17, $18, $19, $20
            ) RETURNING *;
        `;

        const values = [
            driver_type, pay_as_described, short_check, short_check_details,
            paid_miles_match, paid_deadhead, paid_detention, escrow_deduction,
            escrow_amount, escrow_refund, recovery_attempts, pay_misrepresentation,
            weekly_deductions_clear, forced_return_truck, contract_ended_without_cause,
            contract_ended_hos_violation, contract_ended_payoff_date,
            fuel_surcharge_paid, rate_confirmations, fuel_discount
        ];

        try {
            const result = await pool.query(query, values);
            
            // ✅ Debugging: Log successful database insert
            console.log("DB Insert Result:", result.rows[0]);

            res.json({ message: "Survey submitted successfully!", data: result.rows[0] });
        } catch (error) {
            console.error("Error inserting into database:", error);
            res.status(500).json({ error: "Database insert failed." });
        }

    } catch (error) {
        console.error("Error processing survey:", error);
        res.status(500).json({ error: "Server error, please try again later." });
    }
});

// Test Route for Debugging
app.get('/', (req, res) => {
    res.send('Survey API is running...');
});

// Start the Server
app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
});

