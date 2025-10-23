import os
from tkinter import filedialog as fd

def find_word_in_files(search_word, directory):
    """
    Search for a word in all files within a directory and its subdirectories.
    Returns a list of file paths containing the word.
    """
    matching_files = []
    
    # Walk through directory and subdirectories
    for root, _, files in os.walk(directory):
        for file in files:
            file_path = os.path.join(root, file)
            try:
                # Only process text-based files (you can add more extensions if needed)
                if file.endswith(('.css')):
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        # Case-insensitive search
                        if search_word.lower() in content.lower():
                            matching_files.append(file_path)
            except (IOError, UnicodeDecodeError) as e:
                # Skip files that can't be read or aren't text
                continue
                
    return matching_files

# Example usage
if __name__ == "__main__":
    word_to_find = input("Enter the word to search for: ")
    search_directory = input("Enter the directory to search in (e.g., . for current directory): ")
    
    results = find_word_in_files(word_to_find, search_directory)
    
    if results:
        print("\nFiles containing the word '{}':".format(word_to_find))
        for file_path in results:
            print(file_path)
    else:
        print("\nNo files found containing the word '{}'.".format(word_to_find))