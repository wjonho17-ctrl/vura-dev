#!/bin/bash

# Vura Ecosystem - Verification & Connection Test Script

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Vura Ecosystem - Setup Verification                   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"

# Test results
TESTS_PASSED=0
TESTS_FAILED=0

# Function to test and report
test_connection() {
    local name=$1
    local command=$2
    local timeout=${3:-5}

    echo -ne "Testing ${name}... "

    if timeout $timeout bash -c "$command" &>/dev/null; then
        echo -e "${GREEN}✓${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗${NC}"
        ((TESTS_FAILED++))
    fi
}

echo -e "\n${YELLOW}[1/4] Docker Services${NC}"
echo "─────────────────────────────────────────────────────────"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker is not installed${NC}"
    exit 1
fi

# Check services status
echo -e "Checking container status...\n"

docker-compose ps --format "table {{.Service}}\t{{.Status}}" 2>/dev/null | {
    read header
    echo "$header"
    while read service status; do
        if [[ $status == *"Up"* ]] || [[ $status == "running" ]]; then
            echo -e "${GREEN}✓${NC} $service"
            ((TESTS_PASSED++))
        else
            echo -e "${RED}✗${NC} $service (Status: $status)"
            ((TESTS_FAILED++))
        fi
    done
} || echo -e "${YELLOW}⚠${NC} Could not retrieve container status"

echo

echo -e "\n${YELLOW}[2/4] Database Connections${NC}"
echo "─────────────────────────────────────────────────────────"

# Test PostgreSQL connection
test_connection "PostgreSQL" "docker exec vura-postgres psql -U postgres -c 'SELECT 1' &>/dev/null"

# Test Redis connection
test_connection "Redis" "docker exec vura-redis redis-cli ping &>/dev/null"

# Check databases exist
echo -ne "Checking required databases... "
if docker exec vura-postgres psql -U postgres -c "\l" 2>/dev/null | grep -qE "backoffice|hms"; then
    echo -e "${GREEN}✓${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${YELLOW}⚠${NC} (May need migration)"
fi

echo

echo -e "\n${YELLOW}[3/4] Application APIs${NC}"
echo "─────────────────────────────────────────────────────────"

# Check if apps are responding
test_connection "Backoffice (3334)" "curl -s http://localhost:3334 &>/dev/null" 10
test_connection "HMS (3335)" "curl -s http://localhost:3335 &>/dev/null" 10
test_connection "PMS (3333)" "curl -s http://localhost:3333 &>/dev/null" 10
test_connection "Mock EBM API (3500)" "curl -s http://localhost:3500/health &>/dev/null" 10

echo

echo -e "\n${YELLOW}[4/4] External Services${NC}"
echo "─────────────────────────────────────────────────────────"

# Check Mailpit
test_connection "Mailpit (8025)" "curl -s http://localhost:8025 &>/dev/null"

# Check Meilisearch
test_connection "Meilisearch (7700)" "curl -s http://localhost:7700/health &>/dev/null"

# Check S3/MinIO if available
test_connection "MinIO/S3 (9000)" "curl -s http://localhost:9000 &>/dev/null" 3

echo

echo -e "\n${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                   Verification Summary                      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"

TOTAL=$((TESTS_PASSED + TESTS_FAILED))
PASS_RATE=$((TESTS_PASSED * 100 / TOTAL))

echo -e "\nTests Passed: ${GREEN}$TESTS_PASSED${NC} / $TOTAL"
if [ $TESTS_FAILED -gt 0 ]; then
    echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
else
    echo -e "Tests Failed: ${GREEN}0${NC}"
fi
echo "Pass Rate: $PASS_RATE%"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}✓ All systems operational!${NC}"
    echo
    echo "Next Steps:"
    echo "  1. Open VSCode: Ctrl+Shift+D (Debug)"
    echo "  2. Select a debug configuration"
    echo "  3. Press F5 to start"
    echo
    echo "URLs to Test:"
    echo "  • Backoffice:  http://localhost:3334"
    echo "  • HMS:         http://localhost:3335"
    echo "  • PMS:         http://localhost:3333"
    echo "  • Mailpit:     http://localhost:8025"
    echo "  • Meilisearch: http://localhost:7700"
    exit 0
else
    echo -e "\n${YELLOW}⚠ Some systems need attention${NC}"
    echo
    echo "Troubleshooting Steps:"
    echo "  1. Check Docker is running: docker ps"
    echo "  2. Restart services: docker-compose restart"
    echo "  3. View logs: docker-compose logs -f"
    echo "  4. See SETUP.md for detailed troubleshooting"
    exit 1
fi
