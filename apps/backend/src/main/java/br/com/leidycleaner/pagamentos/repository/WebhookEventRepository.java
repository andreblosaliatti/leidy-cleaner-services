package br.com.leidycleaner.pagamentos.repository;

import java.util.List;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.ConnectionCallback;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class WebhookEventRepository {

    private final JdbcTemplate jdbcTemplate;
    private final boolean usePostgresOnConflict;

    public WebhookEventRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
        this.usePostgresOnConflict = !isH2Database(jdbcTemplate);
    }

    public boolean registrarSeNovo(String externalId, String eventType, String payload) {
        String payloadJson = normalizarPayload(payload);
        if (!usePostgresOnConflict) {
            return registrarSeNovoCompatibilidadeH2(externalId, eventType, payloadJson);
        }

        List<Long> insertedIds = jdbcTemplate.query("""
                INSERT INTO webhook_events (external_id, event_type, payload)
                VALUES (?, ?, ?::jsonb)
                ON CONFLICT (external_id, event_type) DO NOTHING
                RETURNING id
                """, (resultSet, rowNumber) -> resultSet.getLong("id"), externalId, eventType, payloadJson);
        return !insertedIds.isEmpty();
    }

    private boolean registrarSeNovoCompatibilidadeH2(String externalId, String eventType, String payload) {
        try {
            int rowsAffected = jdbcTemplate.update("""
                    INSERT INTO webhook_events (external_id, event_type, payload)
                    SELECT ?, ?, ?
                    WHERE NOT EXISTS (
                        SELECT 1
                        FROM webhook_events
                        WHERE external_id = ?
                          AND event_type = ?
                    )
                    """, externalId, eventType, payload, externalId, eventType);
            return rowsAffected == 1;
        } catch (DataIntegrityViolationException exception) {
            return false;
        }
    }

    public int countByExternalId(String externalId) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM webhook_events WHERE external_id = ?",
                Integer.class,
                externalId
        );
        return count == null ? 0 : count;
    }

    public int countByExternalIdAndEventType(String externalId, String eventType) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM webhook_events WHERE external_id = ? AND event_type = ?",
                Integer.class,
                externalId,
                eventType
        );
        return count == null ? 0 : count;
    }

    public String payloadByExternalIdAndEventType(String externalId, String eventType) {
        return jdbcTemplate.queryForObject(
                "SELECT payload FROM webhook_events WHERE external_id = ? AND event_type = ?",
                String.class,
                externalId,
                eventType
        );
    }

    private boolean isH2Database(JdbcTemplate jdbcTemplate) {
        String databaseProductName = jdbcTemplate.execute(
                (ConnectionCallback<String>) connection -> connection.getMetaData().getDatabaseProductName()
        );
        return databaseProductName != null && databaseProductName.equalsIgnoreCase("H2");
    }

    private String normalizarPayload(String payload) {
        if (payload == null || payload.isBlank()) {
            return "{}";
        }
        return payload;
    }
}
