$csv = Import-Csv "C:\Users\tlaca\OneDrive\Escritorio\sitio\A.csv" -Encoding UTF8
$jsObj = "window.INITIAL_USERS = {`n"
$credList = @()

foreach ($row in $csv) {
    if (-not [string]::IsNullOrWhiteSpace($row.Identificador)) {
        # Generate random 6 char password
        $chars = "abcdefghjkmnpqrstuvwxyz23456789"
        $pass = ""
        for ($i=0; $i -lt 6; $i++) {
            $pass += $chars[(Get-Random -Maximum $chars.Length)]
        }
        $fullName = ($row.Nombre + " " + $row.Paterno + " " + $row.Materno).Trim()
        $id = $row.Identificador
        
        $jsObj += "  `"$id`": { password: `"$pass`", name: `"$fullName`" },`n"
        
        $credList += [PSCustomObject]@{
            Identificador = $id
            Password = $pass
            NombreCompleto = $fullName
        }
    }
}
$jsObj += "};"

$jsObj | Out-File "C:\Users\tlaca\OneDrive\Escritorio\sitio\js\users_db.js" -Encoding UTF8
$credList | Export-Csv "C:\Users\tlaca\OneDrive\Escritorio\sitio\credenciales.csv" -NoTypeInformation -Encoding UTF8
