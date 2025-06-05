package plugin

import (
	"encoding/json"
	"net/http"

	"bytes"
	"io"

	"github.com/grafana/grafana-plugin-sdk-go/backend/log"
)

// handlePing is an example HTTP GET resource that returns a {"message": "ok"} JSON response.
func (a *App) handlePing(w http.ResponseWriter, req *http.Request) {
	w.Header().Add("Content-Type", "application/json")
	if _, err := w.Write([]byte(`{"message": "ok"}`)); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}

// handleEcho is an example HTTP POST resource that accepts a JSON with a "message" key and
// returns to the client whatever it is sent.
func (a *App) handleEcho(w http.ResponseWriter, req *http.Request) {
	if req.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var body struct {
		Message string `json:"message"`
	}
	if err := json.NewDecoder(req.Body).Decode(&body); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	w.Header().Add("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(body); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}

// registerRoutes takes a *http.ServeMux and registers some HTTP handlers.
func (a *App) registerRoutes(mux *http.ServeMux) {
	log.DefaultLogger.Info("backend registerRoutes")
	mux.HandleFunc("/ping", a.handlePing)
	mux.HandleFunc("/query", a.handleProxyQuery)
}

func (a *App) handleProxyQuery(w http.ResponseWriter, r *http.Request) {
	// 从请求中读取 SQL 和 datasource UID
	query := r.URL.Query()
	sql := query.Get("sql")
	dsUID := query.Get("dsUid")
	if sql == "" || dsUID == "" {
		http.Error(w, "Missing sql or dsUid", http.StatusBadRequest)
		return
	}

	// 构造请求体：符合目标 datasource 插件的格式（这里是 rawSql for MySQL）
	bodyData := map[string]interface{}{
		"queries": []map[string]interface{}{
			{
				"refId": "A",
				"datasource": map[string]string{
					"uid": dsUID,
				},
				"rawSql": "SELECT * FROM otel.otel_logs LIMIT 10",
				"format": "table",
			},
		},
	}
	// 将 map 编码为 JSON 字节流
	jsonBody, err := json.Marshal(bodyData)
	if err != nil {
		// log.Println("Failed to marshal JSON:", err)
		return
	}

	// 创建 io.Reader
	bodyReader := bytes.NewReader(jsonBody)

	// 创建转发请求
	// req, err := http.NewRequest("POST", "http://localhost:3000/api/ds/query", bytes.NewReader(bodyBytes))
	req, err := http.NewRequest("POST", "http://localhost:3000/api/ds/query", bodyReader)
	if err != nil {
		http.Error(w, "Failed to create request: "+err.Error(), http.StatusInternalServerError)
		return
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Datasource-Uid", dsUID) // 设置目标 datasource UID
	// req.Header.Set("Authorization", "Bearer "+os.Getenv("GF_API_TOKEN")) // 可选：设置 Grafana API Token

	// 发送请求
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		http.Error(w, "Request failed: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	// 读取并返回结果
	respBody, _ := io.ReadAll(resp.Body)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(resp.StatusCode)
	w.Write(respBody)
}
