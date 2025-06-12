resource "aws_cloudwatch_log_group" "otel_logs" {
  name              = "/ecs/search-service-cidev/otel/restricted-word-web-log"
  retention_in_days = var.otel_log_group_retention_in_days
}

resource "aws_cloudwatch_log_stream" "log_stream" {
  name           = "testing-integrations-stream"
  log_group_name = aws_cloudwatch_log_group.otel_logs.name
}