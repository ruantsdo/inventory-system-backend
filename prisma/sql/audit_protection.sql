REVOKE UPDATE, DELETE ON TABLE audit_events FROM app_user;
GRANT SELECT, INSERT ON TABLE audit_events TO app_user;

CREATE OR REPLACE FUNCTION block_audit_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION
    'A tabela de auditoria (audit_events) é Append-Only. '
    'Operações de UPDATE e DELETE são estritamente proibidas.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_protect_audit_logs
BEFORE UPDATE OR DELETE ON audit_events
FOR EACH ROW
EXECUTE FUNCTION block_audit_modification();
