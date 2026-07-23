const fs = require('fs');
const path = require('path');

const DISCLAIMER = '⚕️ This is not medical advice. Consult a healthcare provider.';

const queryRag = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ success: false, message: 'Query is required' });
    }
    
    // Simple native RAG search
    const lowerQuery = query.toLowerCase();
    const knowledgeDirs = ['diseases', 'medicines', 'guidelines', 'faq'];
    const results = [];
    
    for (const dir of knowledgeDirs) {
        const dirPath = path.join(__dirname, '..', '..', 'knowledge', dir);
        if (!fs.existsSync(dirPath)) continue;
        
        const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.md'));
        for (const file of files) {
            const content = fs.readFileSync(path.join(dirPath, file), 'utf-8');
            if (content.toLowerCase().includes(lowerQuery) || file.toLowerCase().includes(lowerQuery)) {
                results.push({
                    name: file.replace('.md', ''),
                    category: dir,
                    snippet: content.substring(0, 500) + '...'
                });
            }
        }
    }
    
    const context = results.slice(0, 3).map(r => r.snippet).join('\n\n');
    const sources = results.slice(0, 3).map(r => ({ name: r.name, category: r.category }));
    
    return res.status(200).json({ 
        success: true, 
        data: {
            query,
            context: context || "No relevant information found in knowledge base.",
            sources
        }, 
        disclaimer: DISCLAIMER 
    });
  } catch (error) {
    console.error('RAG query error:', error);
    res.status(500).json({ success: false, message: 'Server error', disclaimer: DISCLAIMER });
  }
};

const getDisease = async (req, res) => {
  try {
    const { name } = req.params;
    const filePath = path.join(__dirname, '..', '..', 'knowledge', 'diseases', `${name}.md`);
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        return res.status(200).json({ success: true, data: { name, content }, disclaimer: DISCLAIMER });
    }
    res.status(404).json({ success: false, message: 'Disease information not found', disclaimer: DISCLAIMER });
  } catch (error) {
    console.error('RAG getDisease error:', error);
    res.status(500).json({ success: false, message: 'Server error', disclaimer: DISCLAIMER });
  }
};

const getMedicine = async (req, res) => {
  try {
    const { name } = req.params;
    const filePath = path.join(__dirname, '..', '..', 'knowledge', 'medicines', `${name}.md`);
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        return res.status(200).json({ success: true, data: { name, content }, disclaimer: DISCLAIMER });
    }
    res.status(404).json({ success: false, message: 'Medicine information not found', disclaimer: DISCLAIMER });
  } catch (error) {
    console.error('RAG getMedicine error:', error);
    res.status(500).json({ success: false, message: 'Server error', disclaimer: DISCLAIMER });
  }
};

module.exports = {
  queryRag,
  getDisease,
  getMedicine
};
