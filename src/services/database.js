import { supabase } from '../lib/supabase.js';

export const categoriesService = {
  async getAll() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(category) {
    const { data, error } = await supabase
      .from('categories')
      .insert([category])
      .select();

    if (error) throw error;
    return data[0];
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('categories')
      .update({ ...updates, updated_at: new Date() })
      .eq('id', id)
      .select();

    if (error) throw error;
    return data[0];
  },

  async delete(id) {
    // First check if category has photos
    const { data: photos, error: photoError } = await supabase
      .from('photos')
      .select('id')
      .eq('category_id', id)
      .limit(1);

    if (photoError) throw photoError;

    if (photos && photos.length > 0) {
      throw new Error('Cannot delete category that contains photos. Please delete all photos in this category first.');
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
};

export const photosService = {
  async getAll(categoryId = null) {
    let query = supabase
      .from('photos')
      .select(`
        *,
        categories (
          id,
          name
        )
      `)
      .order('created_at', { ascending: false });

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  },

  async create(photo) {
    const { data, error } = await supabase
      .from('photos')
      .insert([photo])
      .select(`
        *,
        categories (
          id,
          name
        )
      `);

    if (error) throw error;
    return data[0];
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('photos')
      .update({ ...updates, updated_at: new Date() })
      .eq('id', id)
      .select(`
        *,
        categories (
          id,
          name
        )
      `);

    if (error) throw error;
    return data[0];
  },

  async updateWithImageReplace(id, updates) {
    // This method handles updating a photo with potential image replacement
    const { data, error } = await supabase
      .from('photos')
      .update({
        title: updates.title,
        category_id: updates.category_id,
        url: updates.url,
        public_id: updates.public_id,
        updated_at: new Date()
      })
      .eq('id', id)
      .select(`
        *,
        categories (
          id,
          name
        )
      `);

    if (error) throw error;
    return data[0];
  },

  async delete(id) {
    const { error } = await supabase
      .from('photos')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
};