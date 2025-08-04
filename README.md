# LLM Translation App

A web application for translating between English and Japanese using the plamo-2-translate LLM model.

This application was developed using Cursor AI Agent.

## Special Notice

The plamo-2-translate model is available on Hugging Face and can be used for free for non-commercial purposes.
However, commercial use requires a special agreement process. Please check the original document carefully.

URL: [https://huggingface.co/pfnet/plamo-2-translate](https://huggingface.co/pfnet/plamo-2-translate)

## Preparation

```bash
make setup-venv
```

## Configuration

The application can be configured using environment variables or Makefile targets.
The hardcoded IP address has been removed and replaced with configurable settings.

### Environment Variables

You can set these environment variables to configure the application:

- `BACKEND_HOST`: Backend server host (default: localhost)
- `BACKEND_PORT`: Backend server port (default: 4000)
- `FRONTEND_HOST`: Frontend server host (default: localhost)
- `FRONTEND_PORT`: Frontend server port (default: 8000)
- `BACKEND_URL`: Full backend URL for frontend to connect to (default: http://localhost:4000)

### Usage Examples

#### Run with default settings (localhost):
```bash
make run-backend
make run-frontend
```

**Note:** Run these commands in separate terminal windows/tabs.

Access the application at http://localhost:8000/ in your web browser.

#### Run with custom backend host:
```bash
BACKEND_HOST=192.168.1.100 make run-backend
BACKEND_HOST=192.168.1.100 make run-frontend
```

Access the application at http://localhost:8000/ in your web browser.

#### Run both services together:
```bash
make run-all
```

#### Run with custom ports:
```bash
BACKEND_PORT=5000 FRONTEND_PORT=9000 make run-all
```

### For different network configurations:

If you need to run the backend on a different machine:

1. Set the backend host when starting the backend:
   ```bash
   BACKEND_HOST=your-backend-ip make run-backend
   ```

2. Set the backend URL when starting the frontend:
   ```bash
   BACKEND_URL=http://your-backend-ip:4000 make run-frontend
   ```

# LICENSE

The code of this repository is available under the Apache License 2.0.

```license:Apache-2.0
Copyright 2025 YasuhiroABE, yasu@yasundial.org

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```
