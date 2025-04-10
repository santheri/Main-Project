import subprocess


def execute_script(file_path):
    try:
        # Use subprocess.run to execute the script and capture stdout
        result = subprocess.run(['python', file_path],
                                capture_output=True, text=True, check=True)
        return result.stdout
    except subprocess.CalledProcessError as e:
        # If the script execution fails, return the error message
        return f"Error executing script: {e.stderr}"
    except FileNotFoundError:
        return f"File {file_path} not found."


# Example usage
if __name__ == "__main__":
    script_path = "d.py"
    output = execute_script(script_path)
    print(output)
