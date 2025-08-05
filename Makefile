
# Environment variables for configuration
BACKEND_HOST ?= localhost
BACKEND_PORT ?= 4000
FRONTEND_HOST ?= localhost
FRONTEND_PORT ?= 8000
TORCH_CUDA_ARCH_LIST ?= 12.0 8.9 8.6

.PHONY: setup-venv
setup-venv:
	python3 -m venv venv
	( . venv/bin/activate ; pip install --upgrade pip )
	( . venv/bin/activate ; pip install wheel )
	( . venv/bin/activate ; pip install setuptools )
	( . venv/bin/activate ; pip install --upgrade pip setuptools wheel )
	( . venv/bin/activate ; pip install --upgrade torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu128 )
	( . venv/bin/activate ; pip install --upgrade "nvidia-modelopt[all]" )
	( . venv/bin/activate ; pip install -r backend/requirements.txt )
	( . venv/bin/activate ; pip install -r frontend/requirements.txt )

.PHONY: setup-sm120
setup-sm120: setup-venv
	( . venv/bin/activate ; git clone https://github.com/Dao-AILab/causal-conv1d.git )
	sed -i -e 's/sm_100/sm_120/' -e 's/compute_100/compute_120/' causal-conv1d/setup.py
	( . venv/bin/activate ; cd causal-conv1d ; pip install -e . --no-build-isolation --break-system-packages )

.PHONY: run-server
run-server:
	( . venv/bin/activate ; cd webapp ; uvicorn main:app --reload --host 0.0.0.0 --port 8000  )

.PHONY: run-frontend
run-frontend:
	( . venv/bin/activate ; cd frontend ; env BACKEND_URL=http://$(BACKEND_HOST):$(BACKEND_PORT) uvicorn main:app --reload --host $(FRONTEND_HOST) --port $(FRONTEND_PORT)  )

.PHONY: run-backend
run-backend:
	( . venv/bin/activate ; cd backend ; env TORCH_CUDA_ARCH_LIST="$(TORCH_CUDA_ARCH_LIST)" uvicorn main:app --reload --host $(BACKEND_HOST) --port $(BACKEND_PORT)  )

.PHONY: run-all
run-all:
	@echo "Starting backend and frontend..."
	@make run-backend &
	@sleep 5
	@make run-frontend
