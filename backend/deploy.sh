echo "Deploying to Server..."

# Pull newest changes
git pull origin main

# Load environment variables from .env file
# Check if the .env file exists in the current directory
if [[ ! -f .env ]]; then
    echo "Error: .env file not found in the current directory."
    exit 1
fi

# Read the .env file line by line
while IFS= read -r line || [[ -n "$line" ]]; do
    # Remove leading and trailing whitespace
    line=$(echo "$line" | sed -e 's/^[ \t]*//' -e 's/[ \t]*$//')

    # Skip empty lines or lines that start with '#'
    if [[ -z "$line" || "$line" =~ ^# ]]; then
        continue
    fi

    # Match key=value pattern, allowing for spaces and quotes
    if [[ "$line" =~ ^([a-zA-Z_][a-zA-Z0-9_]*)[[:space:]]*=[[:space:]]*(\"[^\"]*\"|[^#\r\n]*) ]]; then
        key="${BASH_REMATCH[1]}"
        value="${BASH_REMATCH[2]}"

        # Remove surrounding quotes if present
        value=$(echo "$value" | sed -e 's/^"//' -e 's/"$//')

        # Export the environment variable
        export "$key=$value"
    else
        echo "Warning: skipping invalid line: $line"
    fi
done <.env
echo "Environment variables loaded successfully."

# Install script
bash install.sh
