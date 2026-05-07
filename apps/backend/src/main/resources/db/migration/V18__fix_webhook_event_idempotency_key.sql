ALTER TABLE webhook_events
    DROP CONSTRAINT IF EXISTS webhook_events_external_id_key;

ALTER TABLE webhook_events
    DROP CONSTRAINT IF EXISTS uk_webhook_events_external_id;

ALTER TABLE webhook_events
    DROP CONSTRAINT IF EXISTS uk_webhook_event;

ALTER TABLE webhook_events
    ADD COLUMN IF NOT EXISTS payload JSONB NOT NULL DEFAULT '{}';

ALTER TABLE webhook_events
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE webhook_events
    ADD CONSTRAINT uk_webhook_event UNIQUE (external_id, event_type);

CREATE INDEX IF NOT EXISTS idx_webhook_events_external_id
    ON webhook_events (external_id);

CREATE INDEX IF NOT EXISTS idx_webhook_events_event_type
    ON webhook_events (event_type);

CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at
    ON webhook_events (created_at);
