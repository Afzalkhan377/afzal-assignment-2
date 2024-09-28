# Install all required dependencies
install:
	@echo "Installing dependencies..."
	pip install -r requirements.txt

# Run the Flask app locally on http://localhost:3000
run:
	@echo "Starting the Flask app on http://localhost:3000"
	FLASK_APP=app.py FLASK_RUN_PORT=3000 flask run