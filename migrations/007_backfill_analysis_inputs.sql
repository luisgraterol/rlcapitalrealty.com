-- 007_backfill_analysis_inputs.sql
-- Backfill new STR cost fields on existing property_analyses rows.
-- Only sets keys that are absent — safe to re-run.

UPDATE property_analyses
SET inputs = inputs
  -- Utilities breakdown (replaces combined 'inp-utilities' which is zeroed out)
  || jsonb_build_object('inp-utilities',    COALESCE((inputs->>'inp-utilities')::text, '0'))
  || CASE WHEN NOT (inputs ? 'inp-electricity')          THEN jsonb_build_object('inp-electricity',          '130') ELSE '{}'::jsonb END
  || CASE WHEN NOT (inputs ? 'inp-water')                THEN jsonb_build_object('inp-water',                '45')  ELSE '{}'::jsonb END
  || CASE WHEN NOT (inputs ? 'inp-sewer')                THEN jsonb_build_object('inp-sewer',                '50')  ELSE '{}'::jsonb END
  || CASE WHEN NOT (inputs ? 'inp-garbage')              THEN jsonb_build_object('inp-garbage',              '24')  ELSE '{}'::jsonb END
  -- Supplies
  || CASE WHEN NOT (inputs ? 'inp-linens')               THEN jsonb_build_object('inp-linens',               '41')  ELSE '{}'::jsonb END
  -- Tech & platforms
  || CASE WHEN NOT (inputs ? 'inp-minut-subscription')   THEN jsonb_build_object('inp-minut-subscription',   '10')  ELSE '{}'::jsonb END
  || CASE WHEN NOT (inputs ? 'inp-streaming')            THEN jsonb_build_object('inp-streaming',            '8')   ELSE '{}'::jsonb END
  || CASE WHEN NOT (inputs ? 'inp-airbnb-fee-type')      THEN jsonb_build_object('inp-airbnb-fee-type',      '3%')  ELSE '{}'::jsonb END
  -- Property services
  || CASE WHEN NOT (inputs ? 'inp-has-yard')             THEN jsonb_build_object('inp-has-yard',             'No')  ELSE '{}'::jsonb END
  || CASE WHEN NOT (inputs ? 'inp-lawn-care')            THEN jsonb_build_object('inp-lawn-care',            '0')   ELSE '{}'::jsonb END
  || CASE WHEN NOT (inputs ? 'inp-pest-control')         THEN jsonb_build_object('inp-pest-control',         '51')  ELSE '{}'::jsonb END
  || CASE WHEN NOT (inputs ? 'inp-bulk-pickup')          THEN jsonb_build_object('inp-bulk-pickup',          '8')   ELSE '{}'::jsonb END
  -- Maintenance & admin
  || CASE WHEN NOT (inputs ? 'inp-preventive-inspection') THEN jsonb_build_object('inp-preventive-inspection','50') ELSE '{}'::jsonb END
  || CASE WHEN NOT (inputs ? 'inp-hvac-filters')         THEN jsonb_build_object('inp-hvac-filters',         '10')  ELSE '{}'::jsonb END
  || CASE WHEN NOT (inputs ? 'inp-cpa')                  THEN jsonb_build_object('inp-cpa',                  '42')  ELSE '{}'::jsonb END
  -- One-time startup
  || CASE WHEN NOT (inputs ? 'inp-minut-hardware')       THEN jsonb_build_object('inp-minut-hardware',       '100') ELSE '{}'::jsonb END
  || CASE WHEN NOT (inputs ? 'inp-wifi-router')          THEN jsonb_build_object('inp-wifi-router',          '100') ELSE '{}'::jsonb END
  || CASE WHEN NOT (inputs ? 'inp-welcome-kits')         THEN jsonb_build_object('inp-welcome-kits',         '195') ELSE '{}'::jsonb END
WHERE inputs IS NOT NULL;
