import os

def replace_in_files(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.tsx'):
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()

                # Basic contrast fixes
                new_content = content.replace('bg-white/5', 'bg-black/5')
                new_content = new_content.replace('bg-white/10', 'bg-black/10')
                new_content = new_content.replace('border-white/5', 'border-black/5')
                new_content = new_content.replace('border-white/10', 'border-black/10')
                new_content = new_content.replace('border-white/20', 'border-black/20')
                new_content = new_content.replace('bg-white/20', 'bg-black/20')
                
                # Keep glass border lighter or specific if needed but let's change text
                new_content = new_content.replace('text-white', 'text-nebula-on-surface')

                if new_content != content:
                    with open(path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Updated {file}")

replace_in_files('src')
