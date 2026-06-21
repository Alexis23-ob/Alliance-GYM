// Configuración de Supabase
const supabaseUrl = 'https://fxmfkftqpakgljovlacf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4bWZrZnRxcGFrZ2xqb3ZsYWNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNjE5ODcsImV4cCI6MjA5NzYzNzk4N30.fZhMlj0liualhEnEA8cvFCyHUpuPB3yP854yCydFNE4';

// Crear el cliente de Supabase
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
window.supabase = supabaseClient; // Reasignar globalmente para que el resto del código funcione

console.log("Supabase Client Initialized");
