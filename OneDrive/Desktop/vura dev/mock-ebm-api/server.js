import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = process.env.PORT || 3500;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Mock EBM API' });
});

// Mock EBM API endpoints
// These can be easily replaced with real EBM API calls when needed

// Get Insurance Products
app.get('/api/insurance-products', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: uuidv4(),
        name: 'Basic Health Coverage',
        code: 'BASIC001',
        description: 'Basic health insurance product',
        isActive: true,
      },
      {
        id: uuidv4(),
        name: 'Premium Health Plus',
        code: 'PREMIUM001',
        description: 'Premium health insurance product',
        isActive: true,
      },
    ],
  });
});

// Get Insurance Details
app.get('/api/insurances/:id', (req, res) => {
  res.json({
    success: true,
    data: {
      id: req.params.id,
      name: 'Insurance Company Name',
      code: 'INS001',
      email: 'contact@insurance.com',
      phone: '+1234567890',
      address: 'Insurance Company Address',
      isActive: true,
    },
  });
});

// Verify Prescription
app.post('/api/verify-prescription', (req, res) => {
  const { prescriptionId, patientId } = req.body;

  res.json({
    success: true,
    data: {
      prescriptionId,
      patientId,
      status: 'verified',
      issuedDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      isValid: true,
    },
  });
});

// Get Patient Insurance
app.get('/api/patients/:patientId/insurance', (req, res) => {
  res.json({
    success: true,
    data: {
      patientId: req.params.patientId,
      insuranceId: uuidv4(),
      insuranceName: 'Insurance Company Name',
      policyNumber: 'POL123456',
      isActive: true,
      coverage: {
        medicines: 80,
        consultations: 100,
        procedures: 60,
      },
    },
  });
});

// Submit Claim
app.post('/api/claims', (req, res) => {
  const { patientId, prescriptionId, amount } = req.body;

  res.json({
    success: true,
    data: {
      claimId: uuidv4(),
      patientId,
      prescriptionId,
      amount,
      status: 'submitted',
      submittedDate: new Date().toISOString(),
    },
  });
});

// Get Claim Status
app.get('/api/claims/:claimId', (req, res) => {
  res.json({
    success: true,
    data: {
      claimId: req.params.claimId,
      status: 'approved',
      amount: 5000,
      approvedDate: new Date().toISOString(),
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: err.message,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Endpoint ${req.method} ${req.path} not found`,
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Mock EBM API running on http://0.0.0.0:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
