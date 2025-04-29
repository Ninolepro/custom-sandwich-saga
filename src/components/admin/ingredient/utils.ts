
export const ingredientTypes = [
  { value: 'bread', label: 'Pain' },
  { value: 'protein', label: 'Protéine' },
  { value: 'veggie', label: 'Légume' },
  { value: 'sauce', label: 'Sauce' }
];

export const getTypeLabel = (type: string): string => {
  const typeObj = ingredientTypes.find(t => t.value === type);
  return typeObj ? typeObj.label : type;
};

export const uploadImage = async (
  file: File, 
  name: string, 
  supabase: any
): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const filePath = `ingredient-${name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('sandwich-images')
      .upload(filePath, file);
      
    if (uploadError) {
      console.error(uploadError);
      return null;
    }
    
    const { data } = supabase.storage
      .from('sandwich-images')
      .getPublicUrl(filePath);
      
    return data.publicUrl;
  } catch (error) {
    console.error("Erreur d'upload:", error);
    return null;
  }
};
