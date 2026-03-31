import React from 'react';
import { FileText, Download, X } from 'lucide-react';

const PdfPreviewModal = ({ isOpen, pdfUrl, onClose, onDownload }) => {
    if (!isOpen) return null;

    return (
        <div className="pdf-modal-overlay">
            <div className="pdf-modal-container">
                <div className="pdf-modal-header">
                    <h3><FileText size={20} /> Vista Previa del Reporte</h3>
                    <button className="btn-close-modal" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>
                <div className="pdf-modal-body">
                    {pdfUrl ? (
                        <iframe
                            src={`${pdfUrl}#toolbar=0&navpanes=0`}
                            title="Reporte PDF"
                            width="100%"
                            height="100%"
                            style={{ border: 'none', borderRadius: '4px' }}
                        />
                    ) : (
                        <div className="loading-container" style={{ color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            Generando vista previa...
                        </div>
                    )}
                </div>
                <div className="pdf-modal-footer">
                    <button className="btn-secondary" onClick={onClose}>Cerrar</button>
                    <button className="btn-primary btn-with-icon" onClick={onDownload}>
                        <Download size={16} /> Descargar PDF
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PdfPreviewModal;
