import React, { useState, useEffect, useCallback, memo } from 'react';
import { UserPlus, Save, MapPin, Navigation } from 'lucide-react';
import { tsjService } from '../services/api';
import { showToast } from './Toast';
import { estadoLara, municipiosLara, parroquiasPorMunicipioLara } from './venezuelaData';

// Datos iniciales que coinciden con tu modelo Django
const initialFormData = {
  nombre: '',
  cedula: '',
  telefono: '',
  estado: estadoLara.id,
  municipio: '',
  parroquia: '',
  direccion: '',
  tipo_visita: 'ASESORIA',
  referir_a: 'NO_REFERIDO',
  otra_institucion: '',
  observaciones: '',
  atencion_completada: false
};

const VisitanteForm = memo(({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isSubmitting: externalIsSubmitting,
  initialData,
  isEdit = false
}) => {
  const [formData, setFormData] = useState(initialFormData);
  const [parroquias, setParroquias] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tipoVisitaOpciones, setTipoVisitaOpciones] = useState([]);
  const [institucionOpciones, setInstitucionOpciones] = useState([]);
  const [existingMatches, setExistingMatches] = useState([]);
  const [checkingCedula, setCheckingCedula] = useState(false);

  // Cargar opciones desde API
  useEffect(() => {
    const cargarOpciones = async () => {
      try {
        // Cargar tipos de visita
        const tipoVisitaResponse = await tsjService.getOpcionesTipoVisita();
        setTipoVisitaOpciones(tipoVisitaResponse.data || []);

        // Cargar instituciones
        const institucionResponse = await tsjService.getOpcionesInstituciones();
        setInstitucionOpciones(institucionResponse.data || []);
      } catch (error) {
        console.error('Error cargando opciones:', error);
        // Si falla la API, usar las opciones por defecto del modelo
        setTipoVisitaOpciones([
          ['ASESORIA', 'Asesoría'],
          ['DIVORCIO_MUTUO_ACUERDO', 'Divorcio Mutuo Acuerdo'],
          ['DIVORCIO_POR_DESAFECTO', 'Divorcio por Desafecto'],
          ['CURATELA', 'Curatela'],
          ['TUTELA', 'Tutela'],
          ['DECLARACION_DE_UNICOS_HEREDERERO', 'Declaración de Únicos Herederos Universales'],
          ['MEDIDA_ANTICIPADA_PROHIBICION_SALIDA_PAIS', 'Medida Anticipada Prohibición Salida del País'],
          ['PERMISO_PARA_ESTUDIOS_MENORES', 'Permiso para Estudios Menores de edad en Instituciones de seguridad'],
          ['REGIMEN_MANUTENCION', 'Régimen de Manutención'],
          ['REGIMEN_CONVIVENCIA', 'Régimen de Convivencia'],
          ['CARTA_SOLTERIA', 'Carta de Soltería'],
          ['IMPUGNACION_DE_PATERNIDAD', 'Impugnación de Paternidad'],
          ['PERMISOS_DE_VIAJE', 'Permisos de Viajes'],
          ['TITULO_SUPLITORIO', 'Título Supletorio'],
          ['OTRO', 'Otro']
        ]);
        setInstitucionOpciones([
          ['MINISTERIO_PUBLICO', 'Ministerio Público'],
          ['DEFENSORIA_DEL_PUEBLO', 'Defensoría del Pueblo'],
          ['PREFECTURA', 'Prefectura'],
          ['JUECES_DE_PAZ', 'Jueces de Paz'],
          ['REGISTRO_INMOBILIARIO', 'Registro Inmobiliario'],
          ['REGISTRO_MERCANTIL', 'Registro Mercantil'],
          ['REGISTRO_PRINCIPAL', 'Registro Principal'],
          ['REGISTRO_CIVIL', 'Registro Civil'],
          ['NOTARIA_PUBLICA', 'Notaría Pública'],
          ['COMANDANCIA_POLICIA', 'Comandancia de la Policía'],
          ['CICPC', 'CICPC'],
          ['POLICIA_NACIONAL_BOLIVARIANA', 'Policía Nacional Bolivariana'],
          ['GOBERNACION', 'Gobernación'],
          ['ALCALDIA', 'Alcaldía'],
          ['DEFENSA_PUBLICA', 'Defensa Pública'],
          ['SENIAT', 'SENIAT'],
          ['SEMAT', 'SEMAT'],
          ['SUNDEE', 'SUNDEE'],
          ['SEMAMECF', 'SEMAMECF'],
          ['INAMUJER', 'INAMUJER'],
          ['URDD', 'URDD'],
          ['OAP', 'OAP'],
          ['TRIBUNAL_SUPREMO_JUSTICIA', 'Tribunal Supremo de Justicia (esta misma institución)'],
          ['OTRA_INSTITUCION', 'Otra Institución'],
          ['NO_REFERIDO', 'No requiere referir']
        ]);
      }
    };

    if (isOpen) {
      cargarOpciones();
    }
  }, [isOpen]);

  // Sincronizar datos iniciales y resetear cuando no hay initialData
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Asegurarse de que el estado siempre sea Lara
        const dataConEstado = { ...initialData, estado: estadoLara.id };
        setFormData(dataConEstado);
        
        // Cargar parroquias si hay municipio
        if (initialData.municipio) {
          const parroquiasMunicipio = parroquiasPorMunicipioLara[initialData.municipio] || [];
          setParroquias(parroquiasMunicipio);
        }
      } else {
        // IMPORTANTE: Resetear a datos iniciales cuando NO hay initialData (nuevo registro)
          setFormData(initialFormData);
        setParroquias([]);
      }
    }
  }, [isOpen, initialData]); // Se ejecuta cuando se abre el modal o cambia initialData

  // Cargar parroquias cuando cambie el municipio
  useEffect(() => {
    if (formData.municipio) {
      const parroquiasMunicipio = parroquiasPorMunicipioLara[formData.municipio] || [];
      setParroquias(parroquiasMunicipio);
      
      // Resetear parroquia si no está en las nuevas parroquias
      if (formData.parroquia && !parroquiasMunicipio.some(p => p.id === formData.parroquia)) {
        setFormData(prev => ({ ...prev, parroquia: '' }));
      }
    } else {
      setParroquias([]);
      setFormData(prev => ({ ...prev, parroquia: '' }));
    }
  }, [formData.municipio]);

  // Función para resetear el formulario completamente
  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setParroquias([]);
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // When cedula input loses focus, check if there are existing visits/persona
  const handleCedulaBlur = useCallback(async () => {
    const ced = (formData.cedula || '').trim();
    if (!ced || isEdit) return; // don't check during edit
    setCheckingCedula(true);
    try {
      const params = { search: ced, ordering: '-fecha_hora_ingreso', page_size: 50 };
      const resp = await tsjService.getVisitantes(params);
      const items = resp.data.results ? resp.data.results : resp.data;
      const matches = (items || []).filter(v => String(v.cedula).trim() === ced);
      setExistingMatches(matches);
    } catch (err) {
      console.error('Error comprobando cédula:', err);
      setExistingMatches([]);
    } finally {
      setCheckingCedula(false);
    }
  }, [formData.cedula, isEdit]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.nombre || !formData.cedula || !formData.tipo_visita) {
      showToast('Por favor complete los campos obligatorios: Nombre, Cédula y Tipo de trámite', 'warning');
      return;
    }

    // Validar cédula (entre 6 y 20 caracteres)
    if (formData.cedula.length < 6 || formData.cedula.length > 20) {
      showToast('La cédula debe tener entre 6 y 20 caracteres', 'warning');
      return;
    }

    // Validar municipio seleccionado
    if (!formData.municipio) {
      showToast('Por favor seleccione un municipio', 'warning');
      return;
    }

    // Validar parroquia seleccionada
    if (!formData.parroquia) {
      showToast('Por favor seleccione una parroquia', 'warning');
      return;
    }

    // Validar si seleccionó OTRA_INSTITUCION pero no especificó cuál
    if (formData.referir_a === 'OTRA_INSTITUCION' && !formData.otra_institucion) {
      showToast('Si selecciona "Otra Institución", debe especificar cuál', 'warning');
      return;
    }

    const submitting = externalIsSubmitting !== undefined ? externalIsSubmitting : isSubmitting;
    
    if (!submitting) {
      try {
        setIsSubmitting(true);
        
        // Obtener nombres completos de municipio y parroquia
        const municipioSeleccionado = municipiosLara.find(m => m.id === formData.municipio);
        const parroquiaSeleccionada = parroquias.find(p => p.id === formData.parroquia);
        
        // Crear dirección completa
        const direccionCompleta = [
          formData.direccion,
          parroquiaSeleccionada?.nombre,
          municipioSeleccionado?.nombre,
          estadoLara.nombre
        ].filter(Boolean).join(', ');
        
        // Preparar datos para enviar
        const datosParaEnviar = {
          ...formData,
          municipio: municipioSeleccionado?.nombre || formData.municipio,
          parroquia: parroquiaSeleccionada?.nombre || formData.parroquia,
          direccion: direccionCompleta
        };
        
        await onSubmit(datosParaEnviar);
        
        // IMPORTANTE: Resetear el formulario después de enviar exitosamente
        // Solo si NO es edición (para nuevo registro)
        if (!isEdit) {
          resetForm();
        }
        
      } catch (error) {
        console.error('Error en formulario:', error);
        showToast(`Error al guardar: ${error.response?.data?.detail || error.message || 'Error desconocido'}`, 'danger');
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [formData, parroquias, onSubmit, externalIsSubmitting, isSubmitting, isEdit, resetForm]);

  const handleCancel = useCallback(() => {
    // Solo resetear si NO es edición (para nuevo registro)
    if (!isEdit) {
      resetForm();
    }
    onClose();
  }, [onClose, resetForm, isEdit]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') handleCancel(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, handleCancel]);

  const submitting = externalIsSubmitting !== undefined ? externalIsSubmitting : isSubmitting;

  // Obtener nombre del municipio seleccionado
  const municipioSeleccionado = municipiosLara.find(m => m.id === formData.municipio);
  const parroquiaSeleccionada = parroquias.find(p => p.id === formData.parroquia);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal modal-lg">
        <div className="modal-header">
          <h3>{isEdit ? 'Editar Visitante' : 'Registro de Nuevo Visitante'}</h3>
          <button className="modal-close" onClick={handleCancel}>×</button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              {/* Información personal */}
              <div className="form-section">
                <h4>Información Personal</h4>
                
                <div className="form-group">
                  <label>Nombre Completo *</label>
                  <input
                    type="text"
                    name="nombre"
                    required
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder="Ej: Juan Carlos Pérez Rodríguez"
                    autoComplete="off"
                    disabled={submitting}
                  />
                </div>
                
                <div className="form-group">
                  <label>Cédula *</label>
                  <input
                    type="text"
                    name="cedula"
                    required
                    value={formData.cedula}
                    onChange={handleChange}
                    onBlur={handleCedulaBlur}
                    placeholder="Ej: 1234567890"
                    autoComplete="off"
                    disabled={submitting || isEdit}
                    maxLength={20}
                    minLength={6}
                  />
                  <small className="field-hint">Entre 6 y 20 caracteres</small>
                  {checkingCedula && (
                    <div className="cedula-check">Comprobando cédula...</div>
                  )}
                  {!checkingCedula && existingMatches && existingMatches.length > 0 && (
                    <div className="cedula-match">
                      <div>Persona encontrada con {existingMatches.length} visita(s). ¿Usar datos del registro más reciente?</div>
                      <div className="cedula-match-actions">
                        <button type="button" className="btn-link" onClick={() => {
                          const match = existingMatches[0];
                          // Prefill básico: nombre, telefono, direccion
                          const municipioObj = municipiosLara.find(m => m.nombre === (match.municipio || ''));
                          const municipioId = municipioObj ? municipioObj.id : '';
                          const parroquiasForMun = parroquiasPorMunicipioLara[municipioId] || [];
                          const parroquiaObj = parroquiasForMun.find(p => p.nombre === (match.parroquia || ''));

                          setFormData(prev => ({
                            ...prev,
                            nombre: match.nombre || prev.nombre,
                            telefono: match.telefono || prev.telefono,
                            direccion: match.direccion || prev.direccion,
                            municipio: municipioId || prev.municipio,
                            parroquia: parroquiaObj ? parroquiaObj.id : prev.parroquia
                          }));

                          // update parroquias list for selected municipio
                          if (municipioId) {
                            setParroquias(parroquiasForMun);
                          }

                          // clear matches after using
                          setExistingMatches([]);
                        }}>Usar datos</button>
                        <button type="button" className="btn-link" onClick={() => setExistingMatches([])}>Ignorar</button>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="form-group">
                  <label>Teléfono</label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    placeholder="Ej: 0414-1234567"
                    autoComplete="off"
                    disabled={submitting}
                  />
                </div>
              </div>

              {/* Información de ubicación - Lara */}
              <div className="form-section">
                <h4><MapPin size={16} /> Ubicación (Estado Lara)</h4>
                
                <div className="form-group">
                  <label>Estado</label>
                  <input
                    type="text"
                    value={estadoLara.nombre}
                    disabled
                    className="disabled-input"
                    style={{
                      backgroundColor: '#f3f4f6',
                      color: '#6b7280',
                      cursor: 'not-allowed'
                    }}
                  />
                  <input
                    type="hidden"
                    name="estado"
                    value={estadoLara.id}
                  />
                </div>
                
                <div className="form-group">
                  <label>
                    <Navigation size={14} /> Municipio *
                  </label>
                  <select
                    name="municipio"
                    required
                    value={formData.municipio}
                    onChange={handleChange}
                    disabled={submitting}
                  >
                    <option value="">Seleccione un municipio</option>
                    {municipiosLara.map(municipio => (
                      <option key={municipio.id} value={municipio.id}>
                        {municipio.nombre}
                      </option>
                    ))}
                  </select>
                  {formData.municipio && municipioSeleccionado && (
                    <small className="field-hint">
                      Seleccionado: {municipioSeleccionado.nombre}
                    </small>
                  )}
                </div>
                
                <div className="form-group">
                  <label>Parroquia *</label>
                  <select
                    name="parroquia"
                    required
                    value={formData.parroquia}
                    onChange={handleChange}
                    disabled={submitting || !formData.municipio}
                  >
                    <option value="">{formData.municipio ? 'Seleccione una parroquia' : 'Primero seleccione un municipio'}</option>
                    {parroquias.map(parroquia => (
                      <option key={parroquia.id} value={parroquia.id}>
                        {parroquia.nombre}
                      </option>
                    ))}
                  </select>
                  {formData.parroquia && parroquiaSeleccionada && (
                    <small className="field-hint">
                      Seleccionado: {parroquiaSeleccionada.nombre}
                    </small>
                  )}
                </div>
                
                <div className="form-group full-width">
                  <label>Dirección Completa</label>
                  <textarea
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                    placeholder="Calle, avenida, sector, urbanización, referencia..."
                    rows="3"
                    autoComplete="off"
                    disabled={submitting}
                  />
                  <small className="field-hint">
                    Dirección completa: {[
                      formData.direccion,
                      parroquiaSeleccionada?.nombre,
                      municipioSeleccionado?.nombre,
                      estadoLara.nombre
                    ].filter(Boolean).join(', ')}
                  </small>
                </div>
              </div>

              {/* Información del trámite */}
              <div className="form-section">
                <h4>Información del Trámite</h4>
                
                <div className="form-group">
                  <label>Tipo de Trámite *</label>
                  <select
                    name="tipo_visita"
                    required
                    value={formData.tipo_visita}
                    onChange={handleChange}
                    disabled={submitting}
                  >
                    <option value="">Seleccione un trámite</option>
                    {tipoVisitaOpciones.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Referir a Institución</label>
                  <select
                    name="referir_a"
                    value={formData.referir_a}
                    onChange={handleChange}
                    disabled={submitting}
                  >
                    {institucionOpciones.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                
                {formData.referir_a === 'OTRA_INSTITUCION' && (
                  <div className="form-group">
                    <label>Especifique otra institución *</label>
                    <input
                      type="text"
                      name="otra_institucion"
                      required
                      value={formData.otra_institucion}
                      onChange={handleChange}
                      placeholder="Nombre de la institución"
                      autoComplete="off"
                      disabled={submitting}
                    />
                  </div>
                )}
              </div>

              {/* Observaciones */}
              <div className="form-section full-width">
                <div className="form-group full-width">
                  <label>Observaciones</label>
                  <textarea
                    name="observaciones"
                    value={formData.observaciones}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Observaciones adicionales sobre el visitante o el trámite..."
                    disabled={submitting}
                  />
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={handleCancel}
                disabled={submitting}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Guardando...' : (
                  <>
                    {isEdit ? <Save size={16} /> : <UserPlus size={16} />}
                    {isEdit ? 'Guardar Cambios' : 'Registrar Visitante'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
});

export default VisitanteForm;