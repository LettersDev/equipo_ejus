// laraData.js
export const estadoLara = {
    id: '12',
    nombre: 'Lara'
};

export const municipiosLara = [
    { id: '1201', nombre: 'Andrés Eloy Blanco' },
    { id: '1202', nombre: 'Crespo' },
    { id: '1203', nombre: 'Iribarren' },
    { id: '1204', nombre: 'Jiménez' },
    { id: '1205', nombre: 'Morán' },
    { id: '1206', nombre: 'Palavecino' },
    { id: '1207', nombre: 'Simón Planas' },
    { id: '1208', nombre: 'Torres' },
    { id: '1209', nombre: 'Urdaneta' }
];

export const parroquiasPorMunicipioLara = {
    // Andrés Eloy Blanco
    '1201': [
        { id: '120101', nombre: 'Quebrada Honda de Guache' },
        { id: '120102', nombre: 'Pío Tamayo' },
        { id: '120103', nombre: 'Yacambú' }
    ],

    // Crespo
    '1202': [
        { id: '120201', nombre: 'Freitez' },
        { id: '120202', nombre: 'José María Blanco' }
    ],

    // Iribarren (Barquisimeto)
    '1203': [
        { id: '120301', nombre: 'Aguedo Felipe Alvarado' },
        { id: '120302', nombre: 'Buena Vista' },
        { id: '120303', nombre: 'Catedral' },
        { id: '120304', nombre: 'Concepción' },
        { id: '120305', nombre: 'El Cují' },
        { id: '120306', nombre: 'Juárez' },
        { id: '120307', nombre: 'Santa Rosa' },
        { id: '120308', nombre: 'Tamaca' },
        { id: '120309', nombre: 'Unión' },
        { id: '120310', nombre: 'Juan de Villegas' },
        { id: '120311', nombre: 'Unión' }
    ],

    // Jiménez
    '1204': [
        { id: '120401', nombre: 'Juan Bautista Rodríguez' },
        { id: '120402', nombre: 'Cuara' },
        { id: '120403', nombre: 'Diego de Lozada' },
        { id: '120404', nombre: 'Paraíso de San José' },
        { id: '120405', nombre: 'San Miguel' },
        { id: '120406', nombre: 'Tintorero' },
        { id: '120407', nombre: 'José Bernardo Dorante' },
        { id: '120408', nombre: 'Coronel Mariano Peraza' }
    ],

    // Morán
    '1205': [
        { id: '120501', nombre: 'Anzoátegui' },
        { id: '120502', nombre: 'Bolívar' },
        { id: '120503', nombre: 'Guárico' },
        { id: '120504', nombre: 'Hilario Luna y Luna' },
        { id: '120505', nombre: 'Humocaro Alto' },
        { id: '120506', nombre: 'Humocaro Bajo' },
        { id: '120507', nombre: 'La Candelaria' },
        { id: '120508', nombre: 'Morán' }
    ],

    // Palavecino
    '1206': [
        { id: '120601', nombre: 'Cabudare' },
        { id: '120602', nombre: 'José Gregorio Bastidas' },
        { id: '120603', nombre: 'Agua Viva' }
    ],

    // Simón Planas
    '1207': [
        { id: '120701', nombre: 'Buría' },
        { id: '120702', nombre: 'Gustavo Vega' },
        { id: '120703', nombre: 'Sarare' }
    ],

    // Torres
    '1208': [
        { id: '120801', nombre: 'Altagracia' },
        { id: '120802', nombre: 'Antonio Díaz' },
        { id: '120803', nombre: 'Camacaro' },
        { id: '120804', nombre: 'Castañeda' },
        { id: '120805', nombre: 'Cecilio Zubillaga' },
        { id: '120806', nombre: 'Chiquinquirá' },
        { id: '120807', nombre: 'El Blanco' },
        { id: '120808', nombre: 'Espinoza de los Monteros' },
        { id: '120809', nombre: 'Heriberto Arrollo' },
        { id: '120810', nombre: 'Lara' },
        { id: '120811', nombre: 'Las Mercedes' },
        { id: '120812', nombre: 'Manuel Morillo' },
        { id: '120813', nombre: 'Montaña Verde' },
        { id: '120814', nombre: 'Montes de Oca' },
        { id: '120815', nombre: 'Reyes de Vargas' },
        { id: '120816', nombre: 'Torres' },
        { id: '120817', nombre: 'Trinidad Samuel' }
    ],

    // Urdaneta
    '1209': [
        { id: '120901', nombre: 'Siquisique' },
        { id: '120902', nombre: 'San Miguel' },
        { id: '120903', nombre: 'Moroturo' },
        { id: '120904', nombre: 'Xaguas' }
    ]
};

// Mapa de instituciones disponibles según tipo de trámite.
// Si un trámite no aparece aquí, se muestran TODAS las instituciones.
export const institucionesPorTramite = {
    DIVORCIO_MUTUO_ACUERDO: ['DEFENSA_PUBLICA', 'CIVIL', 'PROTECCION'],
    DIVORCIO_POR_DESAFECTO: ['CIVIL', 'DEFENSA_PUBLICA'],
    CURATELA: ['DEFENSA_PUBLICA', 'PROTECCION'],
    TUTELA: ['PROTECCION', 'DEFENSA_PUBLICA'],
    DECLARACION_DE_UNICOS_HEREDERERO: ['CIVIL', 'DEFENSA_PUBLICA'],
    MEDIDA_ANTICIPADA_PROHIBICION_SALIDA_PAIS: ['PROTECCION', 'DEFENSA_PUBLICA'],
    PERMISO_PARA_ESTUDIOS_MENORES: ['PROTECCION', 'DEFENSA_PUBLICA'],
    REGIMEN_MANUTENCION: ['DEFENSA_PUBLICA', 'PROTECCION'],
    REGIMEN_CONVIVENCIA: ['DEFENSA_PUBLICA', 'PROTECCION'],
    CARTA_SOLTERIA: ['DEFENSA_PUBLICA', 'NOTARIA_PUBLICA'],
    IMPUGNACION_DE_PATERNIDAD: ['DEFENSA_PUBLICA', 'PROTECCION'],
    PERMISOS_DE_VIAJE: ['PROTECCION', 'DEFENSA_PUBLICA'],
    TITULO_SUPLITORIO: ['DEFENSA_PUBLICA', 'CIVIL'],
    EJERCICIO_UNILATERAL_PATRIA_POTESTAD: ['DEFENSA_PUBLICA', 'PROTECCION'],
    COLOCACION_FAMILIAR: ['DEFENSA_PUBLICA', 'PROTECCION'],
    CAMBIO_DE_RESIDENCIA_INTERNACIONAL: ['DEFENSA_PUBLICA', 'CIVIL'],
    UNION_ESTABLE_POST_MORTEN: ['DEFENSA_PUBLICA', 'CIVIL'],
};