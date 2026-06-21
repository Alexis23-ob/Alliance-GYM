// Configuración de Supabase
const supabaseUrl = 'https://fxmfkftqpakgljovlacf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4bWZrZnRxcGFrZ2xqb3ZsYWNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNjE5ODcsImV4cCI6MjA5NzYzNzk4N30.fZhMlj0liualhEnEA8cvFCyHUpuPB3yP854yCydFNE4';

// Crear el cliente de Supabase
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

console.log("Supabase Client Initialized");
