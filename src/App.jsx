import { useEffect, useState, useCallback, useRef } from 'react';
import {
  PawPrint, Building2, Search, Database, Code2, Terminal,
  Boxes, Grid3x3, ShieldCheck, LifeBuoy, Sparkles,
  ChevronLeft, ChevronRight, ShieldAlert, AlertTriangle, FileDown, Loader2,
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';

import sqliImg from './assets/sqli_paejea.png';
import xssImg from './assets/xss_paejea.png';
import comandosImg from './assets/comandos_paejea.png';

/* ─── Paleta por grupo (misma del informe web) ─────────────────────── */
const COLORS = {
  teal:    { bar: 'bg-teal-500',    soft: 'bg-teal-50',    ring: 'ring-teal-200',    chip: 'bg-teal-100 text-teal-700',       icon: 'text-teal-700',    iconBg: 'bg-teal-100',    accentText: 'text-teal-800',    marker: 'text-teal-400',    dot: 'bg-teal-500'    },
  rose:    { bar: 'bg-rose-500',    soft: 'bg-rose-50',    ring: 'ring-rose-200',    chip: 'bg-rose-100 text-rose-700',       icon: 'text-rose-700',    iconBg: 'bg-rose-100',    accentText: 'text-rose-800',    marker: 'text-rose-400',    dot: 'bg-rose-500'    },
  amber:   { bar: 'bg-amber-500',   soft: 'bg-amber-50',   ring: 'ring-amber-200',   chip: 'bg-amber-100 text-amber-700',     icon: 'text-amber-700',   iconBg: 'bg-amber-100',   accentText: 'text-amber-800',   marker: 'text-amber-400',   dot: 'bg-amber-500'   },
  emerald: { bar: 'bg-emerald-500', soft: 'bg-emerald-50', ring: 'ring-emerald-200', chip: 'bg-emerald-100 text-emerald-700', icon: 'text-emerald-700', iconBg: 'bg-emerald-100', accentText: 'text-emerald-800', marker: 'text-emerald-400', dot: 'bg-emerald-500' },
  violet:  { bar: 'bg-violet-500',  soft: 'bg-violet-50',  ring: 'ring-violet-200',  chip: 'bg-violet-100 text-violet-700',   icon: 'text-violet-700',  iconBg: 'bg-violet-100',  accentText: 'text-violet-800',  marker: 'text-violet-400',  dot: 'bg-violet-500'  },
};

/* ─── Bloques reutilizables ────────────────────────────────────────── */
function Lista({ items, color }) {
  const c = COLORS[color];
  return (
    <ul className="space-y-3">
      {items.map((t, i) => (
        <li key={i} className="flex gap-3 text-base leading-relaxed text-slate-600 md:text-lg">
          <span className={`mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full ${c.dot}`} />
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}

function Analogia({ children }) {
  return (
    <blockquote className="mt-5 rounded-r-xl border-l-4 border-teal-400 bg-teal-50/70 px-6 py-3.5 text-base italic text-slate-600 md:text-lg">
      {children}
    </blockquote>
  );
}

function CvssBadge({ cvss, severidad, critica }) {
  const Icon = critica ? ShieldAlert : AlertTriangle;
  const tone = critica
    ? { bg: 'bg-red-50', border: 'border-red-200', iconBg: 'bg-red-100', icon: 'text-red-600', label: 'text-red-400', score: 'text-red-700' }
    : { bg: 'bg-amber-50', border: 'border-amber-200', iconBg: 'bg-amber-100', icon: 'text-amber-600', label: 'text-amber-500', score: 'text-amber-700' };
  return (
    <div className={`flex items-center gap-4 rounded-2xl border-2 ${tone.border} ${tone.bg} px-5 py-4`}>
      <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${tone.iconBg}`}>
        <Icon className={`h-7 w-7 ${tone.icon}`} />
      </div>
      <div>
        <p className={`text-[10px] font-bold uppercase tracking-widest ${tone.label}`}>Severidad {severidad}</p>
        <p className="flex items-baseline gap-1">
          <span className={`text-4xl font-black leading-none tabular-nums ${tone.score}`}>{cvss}</span>
          <span className={`text-lg font-semibold ${tone.score} opacity-50`}>/10</span>
        </p>
      </div>
    </div>
  );
}

function Captura({ src, alt, pie }) {
  return (
    <figure className="m-0">
      <img
        src={src}
        alt={alt}
        className="mx-auto h-auto w-full max-h-[66vh] rounded-xl border border-slate-200 object-contain shadow-lg"
      />
      <figcaption className="mt-2 text-center text-xs text-slate-400">{pie}</figcaption>
    </figure>
  );
}

function Codigo({ children }) {
  return (
    <code className="rounded-md bg-slate-900 px-2 py-1 font-mono text-[13px] font-medium text-teal-300">
      {children}
    </code>
  );
}

// Diapositiva de ataque: texto a la izquierda, captura grande a la derecha
function AtaqueSlide({ badge, descripcion, img, alt, analogia, pie = 'Evidencia — DVWA, nivel Low' }) {
  return (
    <div className="grid items-center gap-8 md:grid-cols-[5fr_6fr] md:gap-12">
      <div className="space-y-5">
        {badge}
        <p className="text-base leading-relaxed text-slate-600 md:text-lg">{descripcion}</p>
        <Analogia>{analogia}</Analogia>
      </div>
      <Captura src={img} alt={alt} pie={pie} />
    </div>
  );
}

/* ─── Mapa de calor (sección 06) ───────────────────────────────────── */
function nivelColor(v) {
  if (v >= 16) return 'bg-red-500 text-white';
  if (v >= 10) return 'bg-orange-400 text-white';
  if (v >= 4) return 'bg-amber-300 text-amber-900';
  return 'bg-emerald-300 text-emerald-900';
}
const ETIQUETAS = {
  '5-5': 'SQL · CMD',
  '4-5': 'Tarjetas',
  '4-4': 'Caída',
  '3-3': 'XSS',
};
function MapaCalor() {
  const impactos = [5, 4, 3, 2, 1];
  const probs = [1, 2, 3, 4, 5];
  return (
    <div className="mx-auto mt-3 max-w-md">
      <div className="flex">
        <div className="flex w-7 items-center justify-center">
          <span className="-rotate-90 whitespace-nowrap text-[10px] font-bold uppercase tracking-widest text-slate-400">Impacto →</span>
        </div>
        <div className="flex-1">
          <div className="grid grid-cols-5 gap-1.5">
            {impactos.map((imp) =>
              probs.map((pr) => {
                const v = imp * pr;
                const etq = ETIQUETAS[`${pr}-${imp}`];
                return (
                  <div
                    key={`${imp}-${pr}`}
                    className={`flex aspect-[7/5] flex-col items-center justify-center rounded-lg text-center ${nivelColor(v)}`}
                  >
                    {etq ? (
                      <span className="px-1 text-[10px] font-bold leading-tight md:text-xs">{etq}</span>
                    ) : (
                      <span className="text-xs font-semibold opacity-80 md:text-sm">{v}</span>
                    )}
                  </div>
                );
              })
            )}
          </div>
          <div className="mt-1 grid grid-cols-5 gap-1.5">
            {probs.map((pr) => (
              <span key={pr} className="text-center text-[10px] font-medium text-slate-400">{pr}</span>
            ))}
          </div>
          <p className="mt-1 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">Probabilidad →</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-red-500" /> Crítico (16–25)</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-orange-400" /> Alto (10–15)</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-amber-300" /> Medio (4–9)</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-emerald-300" /> Bajo (1–3)</span>
      </div>
    </div>
  );
}

/* ─── Tabla compacta genérica ──────────────────────────────────────── */
function Tabla({ head, rows }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
      <table className="w-full border-collapse text-left text-sm md:text-base">
        <thead className="bg-teal-800 text-white">
          <tr>
            {head.map((h, i) => (
              <th key={i} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {rows.map((r, i) => (
            <tr key={i} className="even:bg-slate-50/60">
              {r.map((cell, j) => (
                <td key={j} className="px-4 py-3 align-top text-slate-600">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Definición de las diapositivas ───────────────────────────────── */
const SLIDES = [
  /* 1 · Portada */
  {
    group: 'Auditoría de seguridad', color: 'teal', icon: PawPrint, categoria: 'Inicio',
    portada: true,
  },
  /* 2 · Quiénes son VetAmigos */
  {
    group: 'La empresa', color: 'teal', icon: Building2, categoria: 'La empresa',
    eyebrow: 'Sección 01 · Resumen', titulo: '¿Quiénes son VetAmigos?',
    render: (c) => (
      <>
        <p className="text-base leading-relaxed text-slate-600 md:text-lg">
          Una <strong className="text-slate-800">veterinaria y tienda de mascotas (petshop) que funciona por
          internet</strong>. Nació en Valparaíso en 2019 como una clínica de barrio y hoy atiende clientes de
          todo Chile desde su página web. Combina dos negocios en un mismo sitio:
        </p>
        <div className="mt-5">
          <Lista color="teal" items={[
            <><strong>Veterinaria:</strong> reservar horas, consultas por videollamada y registro de salud de cada mascota.</>,
            <><strong>Tienda (petshop):</strong> alimentos, medicamentos, juguetes y accesorios con despacho a todo Chile.</>,
          ]} />
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[['~18.000', 'clientes'], ['~25.000', 'mascotas'], ['~3.500', 'pedidos/mes'], ['2019', 'fundación']].map(([n, l]) => (
            <div key={l} className={`rounded-xl ${c.soft} px-4 py-3 text-center ring-1 ${c.ring}`}>
              <p className={`text-2xl font-black ${c.accentText}`}>{n}</p>
              <p className="text-xs text-slate-500">{l}</p>
            </div>
          ))}
        </div>
        <Analogia>"El cuidado de tu mascota, a un clic de distancia."</Analogia>
      </>
    ),
  },
  /* 3 · Por qué la auditoría */
  {
    group: 'La empresa', color: 'teal', icon: Search, categoria: 'La empresa',
    eyebrow: 'Sección 01 · Resumen', titulo: '¿Por qué esta auditoría?',
    render: () => (
      <>
        <p className="text-base leading-relaxed text-slate-600 md:text-lg">
          VetAmigos guarda tres grandes grupos de información, y los tres son <strong className="text-slate-800">delicados</strong>:
        </p>
        <div className="mt-4">
          <Tabla
            head={['Información', 'Por qué es sensible']}
            rows={[
              [<strong>Datos de clientes</strong>, 'Nombre, RUT, correo, teléfono y dirección. En malas manos sirven para estafas o suplantación.'],
              [<strong>Datos de mascotas</strong>, 'Ficha de salud e historial veterinario: información privada de la familia.'],
              [<strong>Datos de pago</strong>, 'Tarjetas guardadas. Su robo es pérdida de dinero directa para el cliente.'],
            ]}
          />
        </div>
        <p className="mt-5 text-base leading-relaxed text-slate-600 md:text-lg">
          El portal se construyó "sobre la marcha" y nunca se revisó a fondo. Por eso nos contrataron como
          <strong className="text-slate-800"> auditores de seguridad</strong>: buscar sus debilidades —en un
          ambiente de prueba— antes de que lo haga un atacante.
        </p>
        <Analogia>
          Una auditoría es como llevar el auto a la revisión técnica: un especialista busca las fallas para
          arreglarlas <strong>antes</strong> de que provoquen un accidente.
        </Analogia>
      </>
    ),
  },
  /* 4 · Los tres ataques */
  {
    group: 'Ataques encontrados', color: 'rose', icon: ShieldAlert, categoria: 'Ataques',
    eyebrow: 'Secciones 02–04', titulo: 'Los tres ataques de prueba',
    render: () => (
      <>
        <p className="text-base leading-relaxed text-slate-600 md:text-lg">
          Sobre <strong className="text-slate-800">DVWA</strong> (una aplicación de práctica, en un entorno
          controlado y autorizado) probamos tres ataques. Los tres comparten <strong className="text-slate-800">la
          misma causa raíz</strong>: el portal mezcla los datos que escribe el usuario con sus propias instrucciones,
          y no distingue uno de otro. Esa confusión es la "puerta mal cerrada".
        </p>
        <div className="mt-5 space-y-3">
          {[
            { ic: Database, t: 'Inyección SQL', d: 'Expone toda la base de datos de clientes.', s: '9.8', crit: true },
            { ic: Code2, t: 'XSS reflejado', d: 'Ejecuta código en el navegador de la víctima.', s: '6.1', crit: false },
            { ic: Terminal, t: 'Inyección de comandos', d: 'Toma el control del servidor completo.', s: '10.0', crit: true },
          ].map(({ ic: Ic, t, d, s, crit }) => (
            <div key={t} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-700">
                <Ic className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-800">{t}</p>
                <p className="text-sm text-slate-500">{d}</p>
              </div>
              <span className={`flex-shrink-0 rounded-md px-2.5 py-1 text-sm font-bold ${crit ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                {s}
              </span>
            </div>
          ))}
        </div>
      </>
    ),
  },
  /* 5 · SQL */
  {
    group: 'Ataques encontrados', color: 'rose', icon: Database, categoria: 'Ataque',
    eyebrow: 'Sección 02 · Ataque 1', titulo: 'Inyección SQL',
    render: () => (
      <AtaqueSlide
        badge={<CvssBadge cvss="9.8" severidad="Crítica" critica />}
        img={sqliImg}
        alt="Evidencia de inyección SQL en DVWA"
        descripcion={<>En el campo "User ID" escribimos <Codigo>' OR '1'='1</Codigo> y el portal nos devolvió <strong className="text-slate-800">la lista completa de usuarios</strong>, en vez de un solo cliente.</>}
        analogia={<>Es como pedir la ficha de <strong>un</strong> cliente y que el sistema entregue el listado completo de las 18.000 personas registradas. Esa información nunca debería salir así.</>}
      />
    ),
  },
  /* 6 · XSS */
  {
    group: 'Ataques encontrados', color: 'rose', icon: Code2, categoria: 'Ataque',
    eyebrow: 'Sección 03 · Ataque 2', titulo: 'XSS reflejado',
    render: () => (
      <AtaqueSlide
        badge={<CvssBadge cvss="6.1" severidad="Media" />}
        img={xssImg}
        alt="Evidencia de XSS reflejado en DVWA"
        descripcion={<>En el campo "What's your name?" escribimos <Codigo>{`<script>alert('Jean')</script>`}</Codigo> y el navegador <strong className="text-slate-800">ejecutó el código</strong> en vez de mostrarlo como texto.</>}
        analogia={<>Necesita un <strong>cómplice involuntario</strong>: el atacante debe convencer a un cliente de hacer clic en un enlace trampa. Si nadie cae, el ataque no ocurre. Por eso es "Media" y no crítica.</>}
      />
    ),
  },
  /* 7 · Comandos */
  {
    group: 'Ataques encontrados', color: 'rose', icon: Terminal, categoria: 'Ataque',
    eyebrow: 'Sección 04 · Ataque 3', titulo: 'Inyección de comandos',
    render: () => (
      <AtaqueSlide
        badge={<CvssBadge cvss="10.0" severidad="Crítica" critica />}
        img={comandosImg}
        alt="Evidencia de inyección de comandos en DVWA"
        descripcion={<>En el campo "Enter an IP address" escribimos <Codigo>127.0.0.1; cat /etc/passwd</Codigo> y el servidor <strong className="text-slate-800">ejecutó nuestra orden</strong>, mostrando un archivo interno del sistema.</>}
        analogia={<>La nota máxima posible (10.0). Aquí el atacante deja de solo ver datos: pasa a <strong>dar órdenes directas al servidor</strong>. Son las llaves de todo el negocio.</>}
      />
    ),
  },
  /* 8 · Activos */
  {
    group: 'Análisis de riesgo', color: 'amber', icon: Boxes, categoria: 'Análisis de riesgo',
    eyebrow: 'Sección 05 · Activos', titulo: 'Lo que hay que proteger',
    render: () => (
      <>
        <p className="text-base leading-relaxed text-slate-600 md:text-lg">
          Un <strong className="text-slate-800">activo de información</strong> es todo lo que tiene valor y conviene
          proteger. Antes de decidir qué arreglar primero, hay que tener claro qué estamos cuidando:
        </p>
        <div className="mt-4">
          <Tabla
            head={['Activo', 'Qué ataque lo amenaza']}
            rows={[
              [<><strong>A1</strong> · Base de datos de clientes</>, 'Inyección SQL'],
              [<><strong>A2</strong> · Datos de las mascotas</>, 'Inyección SQL'],
              [<><strong>A3</strong> · Datos de pago (tarjetas)</>, 'Inyección SQL · Comandos'],
              [<><strong>A4</strong> · Cuentas y contraseñas</>, 'XSS'],
              [<><strong>A5</strong> · El servidor y el portal</>, 'Inyección de comandos'],
              [<><strong>A6</strong> · La reputación y la confianza</>, 'Los tres ataques'],
            ]}
          />
        </div>
        <Analogia>
          La inyección SQL y la de comandos ponen en riesgo <strong>muchos</strong> activos a la vez; el XSS golpea
          sobre todo a <strong>un</strong> cliente por vez. Eso ya adelanta cuáles serán las fallas más urgentes.
        </Analogia>
      </>
    ),
  },
  /* 9 · Matriz */
  {
    group: 'Análisis de riesgo', color: 'amber', icon: Grid3x3, categoria: 'Análisis de riesgo',
    eyebrow: 'Sección 06 · Matriz', titulo: 'Matriz de riesgo',
    render: () => (
      <>
        <p className="text-base leading-relaxed text-slate-600 md:text-lg">
          <strong className="text-slate-800">Riesgo = Probabilidad × Impacto.</strong> Cruzando lo que demostramos
          en los ataques con los activos de VetAmigos, ordenamos cinco riesgos de mayor a menor:
        </p>
        <div className="mt-4">
          <Tabla
            head={['Riesgo', 'P', 'I', 'P×I', 'Nivel']}
            rows={[
              ['Inyección de comandos', '5', '5', <strong>25</strong>, <span className="text-red-600 font-semibold">🟥 Crítico</span>],
              ['Inyección SQL', '5', '5', <strong>25</strong>, <span className="text-red-600 font-semibold">🟥 Crítico</span>],
              ['Robo de tarjetas', '4', '5', <strong>20</strong>, <span className="text-red-600 font-semibold">🟥 Crítico</span>],
              ['Caída total del portal', '4', '4', <strong>16</strong>, <span className="text-red-600 font-semibold">🟥 Crítico</span>],
              ['XSS reflejado', '3', '3', <strong>9</strong>, <span className="text-amber-600 font-semibold">🟨 Medio</span>],
            ]}
          />
        </div>
        <Analogia>
          <strong>Cuatro de los cinco riesgos caen en zona roja.</strong> Los riesgos de tarjetas y de caída son
          consecuencia de los dos críticos: corregir SQL y comandos los hace desaparecer también.
        </Analogia>
      </>
    ),
  },
  /* 10 · Mapa de calor */
  {
    group: 'Análisis de riesgo', color: 'amber', icon: Grid3x3, categoria: 'Análisis de riesgo',
    eyebrow: 'Sección 06 · Mapa de calor', titulo: 'Mapa de calor',
    render: () => (
      <>
        <p className="text-base leading-relaxed text-slate-600 md:text-lg">
          Cada falla se ubica cruzando su probabilidad (columnas) con su impacto (filas). Mientras más arriba y
          más a la derecha, <strong className="text-slate-800">más rojo y más urgente</strong>.
        </p>
        <MapaCalor />
      </>
    ),
  },
  /* 11 · Controles */
  {
    group: 'Defensa', color: 'emerald', icon: ShieldCheck, categoria: 'Defensa',
    eyebrow: 'Sección 07 · Controles', titulo: 'Cómo se defiende VetAmigos',
    render: () => (
      <>
        <p className="text-base leading-relaxed text-slate-600 md:text-lg">
          Para cada falla hay dos tipos de medida: <strong className="text-slate-800">prevención</strong> (evitar que
          la puerta exista) y <strong className="text-slate-800">mitigación</strong> (candados extra por si igual la
          encuentran). Se apoyan en marcos reconocidos: OWASP, CIS y NIST.
        </p>
        <div className="mt-4">
          <Tabla
            head={['Prioridad', 'Prevención clave', 'Mitigación clave']}
            rows={[
              [<span className="font-semibold text-slate-800">1 🟥 Comandos</span>, 'No pasar la entrada al servidor + lista blanca', 'Mínimos privilegios + aislar + WAF'],
              [<span className="font-semibold text-slate-800">2 🟥 SQL</span>, 'Consultas parametrizadas', 'Cifrar datos + mínimos privilegios + WAF'],
              [<span className="font-semibold text-slate-800">3 🟨 XSS</span>, 'Escapar la salida', 'CSP + cookies HttpOnly + WAF'],
            ]}
          />
        </div>
        <Analogia>
          Prevenir es poner una buena cerradura; mitigar es tener además alarma, perro y seguro. Lo ideal no es
          elegir una, sino tener las dos.
        </Analogia>
      </>
    ),
  },
  /* 12 · Recuperación */
  {
    group: 'Defensa', color: 'emerald', icon: LifeBuoy, categoria: 'Defensa',
    eyebrow: 'Sección 08 · Recuperación', titulo: 'Si algo igual sale mal',
    render: () => (
      <>
        <p className="text-base leading-relaxed text-slate-600 md:text-lg">
          Ningún sistema es 100% seguro. Por eso VetAmigos necesita un <strong className="text-slate-800">plan de
          recuperación ante desastres</strong>. Si un ataque tiene éxito, este es el orden de acciones:
        </p>
        <div className="mt-5 space-y-2.5">
          {[
            ['Detectar y contener', 'Frenar el daño y aislar lo afectado.'],
            ['Restaurar desde copia limpia', 'Volver a funcionar sin traer el ataque dentro.'],
            ['Cerrar la falla', 'Que no vuelvan a entrar por el mismo lugar.'],
            ['Notificar', 'Avisar a los clientes afectados y a la autoridad.'],
            ['Aprender y mejorar', 'Ajustar las medidas para que no se repita.'],
          ].map(([t, d], i) => (
            <div key={t} className="flex items-center gap-3.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
              <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">{i + 1}</span>
              <p className="text-sm text-slate-600"><strong className="text-slate-800">{t}.</strong> {d}</p>
            </div>
          ))}
        </div>
        <Analogia>
          Es como un plan de evacuación frente a un incendio: cuando la emergencia llega, <strong>no se improvisa,
          se sigue el plan</strong>.
        </Analogia>
      </>
    ),
  },
  /* 13 · Cierre */
  {
    group: 'Cierre', color: 'violet', icon: Sparkles, categoria: 'Cierre',
    eyebrow: 'Conclusión del informe', titulo: 'La seguridad es un hábito',
    render: () => (
      <>
        <p className="text-base leading-relaxed text-slate-600 md:text-lg">
          La auditoría queda completa: se <strong className="text-slate-800">demostraron</strong> tres fallas reales,
          se <strong className="text-slate-800">midió</strong> su gravedad y se <strong className="text-slate-800">ordenaron</strong> por
          urgencia, se propusieron <strong className="text-slate-800">medidas</strong> para prevenirlas y reducir su daño, y un
          <strong className="text-slate-800"> plan</strong> para recuperarse si algo ocurre.
        </p>
        <Analogia>
          La seguridad no es un producto que se compra una vez, sino un <strong>hábito</strong>. Prevenir, vigilar y
          estar preparado para reaccionar es lo que protege lo más valioso del negocio: la <strong>confianza</strong> de
          miles de familias que dejan en sus manos los datos de su mascota y de su tarjeta.
        </Analogia>
        <div className="mt-8 rounded-2xl bg-teal-950 px-6 py-5 text-center">
          <p className="text-sm text-teal-300">VetAmigos · Auditoría de seguridad web</p>
          <p className="mt-1 text-xs text-teal-500">INACAP · TI3034 — Unidad 3 · Empresa ficticia, entorno controlado</p>
        </div>
      </>
    ),
  },
];

/* ─── App ──────────────────────────────────────────────────────────── */
export default function App() {
  const [i, setI] = useState(0);
  const total = SLIDES.length;
  const slide = SLIDES[i];
  const c = COLORS[slide.color];
  const Icono = slide.icon;

  const [descargando, setDescargando] = useState(false);
  const pdfRef = useRef(null);

  const next = useCallback(() => setI((p) => Math.min(p + 1, total - 1)), [total]);
  const prev = useCallback(() => setI((p) => Math.max(p - 1, 0)), []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') { e.preventDefault(); next(); }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); prev(); }
      else if (e.key === 'Home') setI(0);
      else if (e.key === 'End') setI(total - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev, total]);

  // Descarga directa del PDF (sin diálogo): cada diapositiva = una página A4
  const descargarPdf = useCallback(async () => {
    if (descargando || !pdfRef.current) return;
    setDescargando(true);
    try {
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const W = pdf.internal.pageSize.getWidth();
      const H = pdf.internal.pageSize.getHeight();
      const laminas = pdfRef.current.querySelectorAll('[data-pdf-slide]');
      for (let n = 0; n < laminas.length; n++) {
        const canvas = await html2canvas(laminas[n], { scale: 2, backgroundColor: '#ffffff', useCORS: true });
        const img = canvas.toDataURL('image/jpeg', 0.92);
        if (n > 0) pdf.addPage();
        pdf.addImage(img, 'JPEG', 0, 0, W, H);
      }
      pdf.save('Presentacion-VetAmigos.pdf');
    } finally {
      setDescargando(false);
    }
  }, [descargando]);

  return (
    <>
    <div className="flex h-screen flex-col overflow-hidden bg-white text-slate-700 print:hidden">
      {/* Barra de progreso superior */}
      <div className="fixed inset-x-0 top-0 z-30 h-1 bg-slate-200">
        <div className={`h-full ${c.bar} transition-all duration-300`} style={{ width: `${((i + 1) / total) * 100}%` }} />
      </div>

      {/* Encabezado */}
      <header className="flex flex-shrink-0 items-center justify-between px-5 py-3 md:px-10">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 shadow-md shadow-teal-900/30">
            <PawPrint className="h-5 w-5 text-white" />
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-50" />
          </div>
          <div>
            <p className="text-sm font-bold tracking-tight text-slate-800">VetAmigos</p>
            <p className="text-[11px] text-slate-400">Auditoría de seguridad</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`hidden rounded-md px-2.5 py-1 text-[11px] font-semibold sm:inline ${c.chip}`}>{slide.categoria}</span>
          <button
            type="button"
            onClick={descargarPdf}
            disabled={descargando}
            title="Descargar la presentación completa en PDF"
            className="flex items-center gap-1.5 rounded-xl bg-teal-700 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-teal-800 disabled:cursor-wait disabled:opacity-70"
          >
            {descargando ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
            <span className="hidden sm:inline">{descargando ? 'Generando…' : 'Descargar PDF'}</span>
          </button>
          <span className="text-xs tabular-nums text-slate-400">{i + 1} / {total}</span>
        </div>
      </header>

      {/* Diapositiva — a pantalla completa, sin tarjeta */}
      <main className="flex min-h-0 flex-1 items-center justify-center px-6 pb-3 md:px-14 lg:px-20">
        {slide.portada ? (
          <Portada />
        ) : (
          <div className="mx-auto flex max-h-full w-full max-w-[1600px] flex-col justify-center overflow-y-auto py-2">
            <div className="mb-7 flex items-center gap-4">
              <span className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl ${c.iconBg}`}>
                <Icono className={`h-7 w-7 ${c.icon}`} />
              </span>
              <div>
                <p className={`text-sm font-bold uppercase tracking-widest ${c.icon} opacity-80`}>{slide.eyebrow}</p>
                <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl lg:text-5xl">{slide.titulo}</h1>
              </div>
            </div>
            {slide.render(c)}
          </div>
        )}
      </main>

      {/* Navegación */}
      <footer className="flex flex-shrink-0 items-center justify-between gap-4 px-5 py-3 md:px-10">
        <button
          type="button"
          onClick={prev}
          disabled={i === 0}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition-all hover:border-teal-300 hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" /> <span className="hidden sm:inline">Anterior</span>
        </button>

        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {SLIDES.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setI(idx)}
              title={s.titulo || 'Portada'}
              className={`rounded-full transition-all duration-200 ${idx === i ? `h-2 w-5 ${COLORS[s.color].dot}` : 'h-2 w-2 bg-slate-300 hover:bg-slate-400'}`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={next}
          disabled={i === total - 1}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition-all hover:border-teal-300 hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span className="hidden sm:inline">Siguiente</span> <ChevronRight className="h-4 w-4" />
        </button>
      </footer>
    </div>

    {/* Láminas fuera de pantalla que se convierten en las páginas del PDF */}
    <PdfDeck pdfRef={pdfRef} />
    </>
  );
}

/* ─── Deck para el PDF (fuera de pantalla, tamaño A4) ───────────────── */
// Cada lámina mide proporción A4 (210×297). 920×1301 px da buena resolución.
function PdfDeck({ pdfRef }) {
  return (
    <div
      ref={pdfRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 -z-50 opacity-0"
      style={{ width: 920 }}
    >
      {SLIDES.map((slide, idx) => {
        const c = COLORS[slide.color];
        const Icono = slide.icon;
        return (
          <div
            key={idx}
            data-pdf-slide
            className="flex flex-col overflow-hidden bg-white"
            style={{ width: 920, height: 1301 }}
          >
            <div className={`h-2 w-full flex-shrink-0 ${c.bar}`} />
            {slide.portada ? (
              <div className="flex flex-1 items-center justify-center">
                <Portada />
              </div>
            ) : (
              <div className="flex flex-1 flex-col justify-center px-14 py-10">
                <div className="mb-7 flex items-center gap-3">
                  <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${c.iconBg}`}>
                    <Icono className={`h-7 w-7 ${c.icon}`} />
                  </span>
                  <div>
                    <p className={`text-sm font-bold uppercase tracking-widest ${c.icon} opacity-80`}>{slide.eyebrow}</p>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900">{slide.titulo}</h1>
                  </div>
                </div>
                {slide.render(c)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Portada ──────────────────────────────────────────────────────── */
function Portada() {
  return (
    <div className="min-h-0 overflow-y-auto px-7 py-10 text-center md:px-12 md:py-14">
      <div className="mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-teal-500 to-teal-700 shadow-xl shadow-teal-900/30">
        <PawPrint className="h-10 w-10 text-white" />
      </div>
      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-600">VetAmigos</p>
      <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 md:text-5xl">
        Auditoría de seguridad web
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-slate-500 md:text-lg">
        Análisis de riesgos para una veterinaria y petshop online. Buscamos las debilidades del portal antes de que
        lo haga un atacante, medimos su gravedad y recomendamos cómo solucionarlas.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-xs">
        <span className="rounded-full bg-rose-100 px-3 py-1 font-medium text-rose-700">3 ataques demostrados</span>
        <span className="rounded-full bg-amber-100 px-3 py-1 font-medium text-amber-700">5 riesgos priorizados</span>
        <span className="rounded-full bg-emerald-100 px-3 py-1 font-medium text-emerald-700">Controles y recuperación</span>
      </div>
      <p className="mt-9 text-xs text-slate-400">
        INACAP · TI3034 — Unidad 3 · Empresa ficticia, entorno controlado y autorizado
      </p>
      <p className="mt-6 inline-flex items-center gap-1.5 text-xs text-slate-400">
        <ChevronRight className="h-3.5 w-3.5" /> Usa las flechas del teclado o los botones para avanzar
      </p>
    </div>
  );
}
