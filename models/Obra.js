const mongoose = require('mongoose');

const ObraSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  responsavel: { type: String, required: true },
  dataInicio: { type: Date, required: true },
  dataFim: { type: Date, required: true },
  localizacao: {
    lat: { type: Number, required: true },
    long: { type: Number, required: true }
  },
  descricao: { type: String, required: true },
  foto: { type: String } // base64 ou URL
}, { timestamps: true });

module.exports = mongoose.model('Obra', ObraSchema);
