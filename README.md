# 💰 Finanzas Personales

App minimalista para control de ingresos y gastos personales, construida con React + Vite + Supabase.

---

## Stack

- **Frontend**: React 18 + Vite
- **Backend**: Supabase (PostgreSQL + API REST)
- **Routing**: React Router v6
- **Estilos**: CSS puro con variables (sin frameworks)

---

## 1. Crear el proyecto en Supabase

1. Entrá a [https://supabase.com](https://supabase.com) y creá una cuenta (es gratis)
2. Creá un **nuevo proyecto** y elegí una región cercana (ej: South America)
3. Esperá a que el proyecto se inicialice (~1 min)

---

## 2. Crear las tablas en Supabase

Andá a **SQL Editor** en el dashboard de Supabase y ejecutá el siguiente SQL:

```sql
-- Tabla clientes
CREATE TABLE clientes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('gym', 'futbol')),
  precio_mensual NUMERIC NOT NULL DEFAULT 0,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla movimientos
CREATE TABLE movimientos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo TEXT NOT NULL CHECK (tipo IN ('ingreso', 'gasto')),
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  monto NUMERIC NOT NULL,
  categoria TEXT NOT NULL,
  descripcion TEXT,
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para mejorar performance en filtros por fecha
CREATE INDEX idx_movimientos_fecha ON movimientos(fecha DESC);
CREATE INDEX idx_movimientos_tipo ON movimientos(tipo);
CREATE INDEX idx_movimientos_cliente ON movimientos(cliente_id);
```

### Configurar Row Level Security (RLS)

Como la app es de uso personal y no tiene auth, lo más simple es deshabilitar RLS o crear políticas abiertas:

```sql
-- Opción A: Deshabilitar RLS (más simple para uso local/personal)
ALTER TABLE clientes DISABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos DISABLE ROW LEVEL SECURITY;
```

> ⚠️ **Nota**: Si vas a exponer la app públicamente, considerá habilitar RLS con políticas apropiadas o agregar autenticación.

---

## 3. Obtener las credenciales

En el dashboard de Supabase andá a:
**Settings → API** y copiá:
- **Project URL** → `VITE_SUPABASE_URL`
- **anon / public key** → `VITE_SUPABASE_ANON_KEY`

---

## 4. Configurar variables de entorno

En la raíz del proyecto, creá un archivo `.env` basado en el ejemplo:

```bash
cp .env.example .env
```

Editá `.env` con tus valores reales:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 5. Correr en local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

La app estará disponible en `http://localhost:5173`

---

## 6. Build para producción

```bash
npm run build
```

Los archivos compilados quedan en la carpeta `dist/`.

---

## 7. Deploy en Vercel

### Opción A: Deploy desde la CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Seguir los pasos del asistente:
# - Framework: Vite
# - Build command: npm run build
# - Output directory: dist
```

### Opción B: Deploy desde GitHub

1. Subí el proyecto a un repositorio de GitHub
2. Andá a [https://vercel.com](https://vercel.com) → **New Project**
3. Importá el repo
4. En **Environment Variables**, agregá:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Hacé click en **Deploy**

### Opción C: Netlify

```bash
npm run build
# Arrastrá la carpeta `dist` a https://app.netlify.com/drop
```

O conectá el repo en Netlify con las mismas variables de entorno.

---

## Estructura del proyecto

```
finanzas-app/
├── public/
├── src/
│   ├── components/
│   │   ├── MovimientoForm.jsx   # Formulario crear/editar movimiento
│   │   ├── ClienteForm.jsx      # Formulario crear/editar cliente
│   │   └── ConfirmDialog.jsx    # Diálogo de confirmación al eliminar
│   ├── pages/
│   │   ├── Dashboard.jsx        # Resumen mensual + últimos movimientos
│   │   ├── Movimientos.jsx      # CRUD completo de movimientos
│   │   └── Clientes.jsx         # CRUD completo de clientes
│   ├── services/
│   │   ├── supabase.js          # Inicialización del cliente Supabase
│   │   ├── movimientos.js       # Todas las queries de movimientos
│   │   └── clientes.js          # Todas las queries de clientes
│   ├── utils/
│   │   └── formatters.js        # Formateo de moneda, fechas y constantes
│   ├── App.jsx                  # Layout principal + navegación
│   ├── main.jsx                 # Entry point
│   └── index.css                # Estilos globales
├── .env.example
├── .gitignore
├── index.html
├── package.json
└── vite.config.js
```

---

## Funcionalidades

- **Dashboard**: Cards con ingresos, gastos y balance del mes. Filtros por mes/año. Últimos 10 movimientos.
- **Movimientos**: Crear, editar y eliminar movimientos. Filtros por mes, año y tipo. Confirmación antes de eliminar.
- **Clientes**: CRUD completo. Activar/desactivar cliente. Facturación estimada mensual.

---

## Categorías disponibles

**Ingresos**: Gym, Fútbol, Clase particular, Transferencia, Otro ingreso

**Gastos**: Alquiler, Servicios, Alimentos, Transporte, Indumentaria, Salud, Entretenimiento, Material deportivo, Otro gasto

---

## Agregar más tipos de cliente o categorías

Editá el archivo `src/utils/formatters.js`:

```js
export const CATEGORIAS_INGRESO = [
  'Gym', 'Fútbol', /* agregá acá */
]

export const CATEGORIAS_GASTO = [
  'Alquiler', /* agregá acá */
]
```

Para agregar tipos de cliente, modificá el `CHECK` en el SQL de Supabase y el `<select>` en `ClienteForm.jsx`.
