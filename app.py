from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

PRODUCTOS_EJEMPLO = [
    "Bistec de res", "Molida de res", "Costilla de res", "Pierna de res",
    "Falda de res", "Chuleta de res", "Carne para asar", "Bistec de cerdo",
    "Molida de cerdo", "Chuleta de cerdo", "Costilla de cerdo", "Pierna de cerdo",
    "Pollo entero", "Pechuga de pollo", "Muslo de pollo", "Ala de pollo",
    "Chorizo", "Longaniza", "Salchicha", "Jamón", "Tocino", "Mortadela",
    "Queso fresco", "Queso panela", "Crema", "Requesón", "Pescado",
    # ... agrega aquí los 80 reales cuando los tengas
]

@app.route('/')
def inicio():
    return render_template('index.html')

@app.route('/entrada')
def entrada():
    return render_template('entrada.html')

@app.route('/api/entrada',methods=['POST'])
def api_entrada():
    datos=request.get_json()
    print("Recibí: ", datos)
    return jsonify({
        "ok":True,
        "mensaje": f"Entrada recibida: {datos.get('producto')} - {datos.get('peso')} kg"

    })
@app.route('/api/productos')
def api_productos():
    q = request.args.get('q', '').lower().strip()
    if q == '':
        # Sin búsqueda: devolver los primeros 8 (favoritos simulados)
        return jsonify(PRODUCTOS_EJEMPLO[:8])
    # Filtrar por coincidencia simple (luego lo cambiamos por fuzzy)
    resultados = [p for p in PRODUCTOS_EJEMPLO if q in p.lower()]
    return jsonify(resultados[:10])


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)