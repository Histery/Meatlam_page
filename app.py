from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

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



if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)