import React from 'react';
import { Copy } from 'lucide-react';

export const BackendDocs: React.FC = () => {
  const sqlCode = `-- 3. Banco de Dados (PostgreSQL Compatible)

-- Tabela de Usuários (Atores)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL, -- Obrigatório para WhatsApp
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'leader', 'intermittent') NOT NULL DEFAULT 'intermittent',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Vagas
CREATE TABLE vacancies (
    id SERIAL PRIMARY KEY,
    creator_id INT NOT NULL REFERENCES users(id),
    title VARCHAR(150) NOT NULL,
    description TEXT,
    work_date TIMESTAMP NOT NULL,
    value DECIMAL(10, 2) NOT NULL,
    status ENUM('open', 'filled', 'canceled') DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Candidaturas
CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    vacancy_id INT NOT NULL REFERENCES vacancies(id),
    user_id INT NOT NULL REFERENCES users(id),
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(vacancy_id, user_id) -- Impede candidatura duplicada
);`;

  const nodeCode = `// 5. Estrutura da API (Node.js/Express)
const express = require('express');
const router = express.Router();
const { User, Application, Vacancy } = require('./models'); // Pseudo-ORM
const { sendWhatsAppConfirmation } = require('./services/whatsapp');

// Middleware de Autenticação e RBAC
const auth = require('./middleware/auth');
const checkRole = (roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
    next();
};

// Rota: Aprovar Candidatura (Gatilho Crítico)
router.patch('/applications/:id/approve', 
    auth, 
    checkRole(['leader', 'admin']), 
    async (req, res) => {
        try {
            const applicationId = req.params.id;
            
            // 1. Buscar candidatura e relacionamentos
            const application = await Application.findByPk(applicationId, {
                include: [{ model: User, as: 'candidate' }, { model: Vacancy, as: 'vacancy' }]
            });

            if (!application) return res.status(404).json({ error: 'Not found' });

            // 2. Atualizar status
            application.status = 'approved';
            await application.save();

            // 3. Integração WhatsApp (Regra de Negócio)
            const phone = application.candidate.phone;
            const message = \`Olá \${application.candidate.name}, sua vaga para \${application.vacancy.title} foi confirmada!\`;
            
            // Função modular (Dispara e esquece ou await dependendo da criticidade)
            sendWhatsAppConfirmation(phone, message);

            return res.json({ message: 'Aprovado com sucesso e notificação enviada.', data: application });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
);

// Função Modular de WhatsApp
// services/whatsapp.js
const sendWhatsAppConfirmation = async (phone, message) => {
    try {
        console.log(\`[WhatsApp] Sending to \${phone}: \${message}\`);
        // Integração com API Externa (Ex: Twilio, Evolution API)
        // await axios.post(API_URL, { number: phone, text: message });
    } catch (e) {
        console.error("Falha ao enviar WhatsApp", e);
        // Implementar lógica de retry ou fila (Redis/Bull)
    }
};

module.exports = router;`;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-2">Objetivo desta Tela</h3>
        <p className="text-slate-600">
          Esta aplicação React é uma demonstração funcional. Abaixo estão os scripts solicitados para a implementação real do Backend e Banco de Dados.
        </p>
      </div>

      {/* SQL Section */}
      <div className="bg-slate-900 rounded-xl overflow-hidden shadow-lg">
        <div className="bg-slate-800 px-6 py-3 flex justify-between items-center border-b border-slate-700">
          <h4 className="text-blue-400 font-mono font-bold text-sm">database_schema.sql</h4>
          <Copy size={16} className="text-slate-400 cursor-pointer hover:text-white" />
        </div>
        <div className="p-6 overflow-x-auto">
          <pre className="font-mono text-sm text-slate-300 leading-relaxed">
            {sqlCode}
          </pre>
        </div>
      </div>

      {/* Node Section */}
      <div className="bg-slate-900 rounded-xl overflow-hidden shadow-lg">
        <div className="bg-slate-800 px-6 py-3 flex justify-between items-center border-b border-slate-700">
          <h4 className="text-green-400 font-mono font-bold text-sm">routes/applications.js</h4>
          <Copy size={16} className="text-slate-400 cursor-pointer hover:text-white" />
        </div>
        <div className="p-6 overflow-x-auto">
          <pre className="font-mono text-sm text-slate-300 leading-relaxed">
            {nodeCode}
          </pre>
        </div>
      </div>
    </div>
  );
};