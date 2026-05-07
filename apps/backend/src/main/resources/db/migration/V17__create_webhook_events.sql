CREATE TABLE webhook_events (
    id BIGSERIAL PRIMARY KEY,
    external_id VARCHAR(100) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_webhook_event UNIQUE (external_id, event_type)
);

CREATE INDEX idx_webhook_events_external_id
    ON webhook_events (external_id);

CREATE INDEX idx_webhook_events_event_type
    ON webhook_events (event_type);

CREATE INDEX idx_webhook_events_created_at
    ON webhook_events (created_at);
