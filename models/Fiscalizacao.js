const mongoose = require('mongoose');

const FiscalizacaoSchema = new mongoose.Schema({
  data: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['Em dia', 'Atrasada', 'Parada'], 
    required: true 
  },
  observacoes: { type: String, required: true },
  localizacao: {
    lat: { type: Number, required: true },
    long: { type: Number, required: true }
  },
  foto: { type: String }, // base64 ou URL
  obra: { type: mongoose.Schema.Types.ObjectId, ref: 'Obra', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Fiscalizacao', FiscalizacaoSchema);
