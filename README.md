<h1>Profit & Lost Backend</h1>

<h2>Descripción</h2>
Profit-Lost.com es una aplicación web avanzada desarrollada en React con Typescript, centrada en la gestión y visualización de datos financieros. Esta aplicación está diseñada para proporcionar a los usuarios una herramienta intuitiva y eficaz para el seguimiento de sus finanzas personales o empresariales, con énfasis en la claridad y la facilidad de uso.

<h2>Características Principales</h2>
<ul>
  <li>Gestión de cuentas financieras.</li>
  <li>Seguimiento de movimientos financieros.</li>
  <li>Gestión de categorías.</li>
  <li>Autenticación de usuarios.</li>
  <li>Middleware de autenticación.</li>
  <li>Respaldo y restauración de base de datos.</li>
</ul>

<h2>Tecnologías Utilizadas</h2>
<ul>
  <li>Node.js</li>
  <li>Express</li>
  <li>MongoDB</li>
  <li>JWT para autenticación</li>
  <li>Mongoose</li>
  <li>dotenv para la gestión de variables de entorno</li>
</ul>

<h2>Prerrequisitos</h2>
<p>Antes de comenzar, asegúrate de tener instalado <a href="https://nodejs.org/">Node.js</a> y <a href="https://www.mongodb.com/">MongoDB</a> en tu sistema.</p>

<h2>Desarrollo y Contribuciones</h2>
<ol>
  <li>Clona el repositorio: <code>git clone https://github.com/brianglezn/profit-lost.com_BackEnd.git</code></li>
  <li>Navega al directorio del proyecto: <code>cd profit-lost.com_BackEnd</code></li>
  <li>Instala las dependencias del proyecto: <code>npm install</code></li>
  <li>Crea un archivo <code>.env</code> en la raíz del proyecto con las siguientes variables:
    <pre><code>
    PORT=3000
    JWT_SECRET=tu_clave_secreta
    DB_USER=tu_userName_bdd
    DB_PASS=tu_userPass_bdd
    DB_NAME=tu_bdd_name
</code></pre>
  </li>
  <li>Ejecuta el servidor en modo de desarrollo: <code>npm run dev</code></li>
</ol>

<h2>Scripts Disponibles</h2>
<ul>
  <li><code>npm start</code>: Inicia el servidor en modo producción.</li>
  <li><code>npm run dev</code>: Inicia el servidor en modo desarrollo.</li>
  <li><code>npm run lint</code>: Ejecuta ESLint para encontrar y arreglar problemas en el código.</li>
</ul>
   
<h2>Licencia</h2>
Este proyecto está bajo la Licencia MIT.

<h2>Contacto</h2>
Brian González Novoa - brianglezn@gmail.com
