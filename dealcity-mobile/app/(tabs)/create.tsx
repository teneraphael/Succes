import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { Text, View } from '@/components/Themed';
import { PlusCircle, MapPin, Tag, DollarSign } from 'lucide-react-native';
import { supabase } from '@/services/supabase';

export default function CreateScreen() {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title || !price || !location) {
      Alert.alert('Oups !', 'Veuillez remplir au moins le titre, le prix et le quartier.');
      return;
    }

    try {
      setLoading(true);

      // Insertion dans la table "posts" de Supabase
      const { error } = await supabase.from('posts').insert([
        {
          title: title,
          content: description || title,
          price: price,
          location: location,
          username: 'Utilisateur_DealCity', // Tu pourras remplacer par le vrai nom du user connecté plus tard
        },
      ]);

      if (error) throw error;

      Alert.alert('Succès !', 'Ton annonce a été publiée sur DealCity 🇨🇲');
      
      // Réinitialiser le formulaire
      setTitle('');
      setPrice('');
      setLocation('');
      setDescription('');
    } catch (error: any) {
      console.error("Erreur lors de la publication :", error);
      Alert.alert('Erreur', "Impossible de publier l'annonce pour le moment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Publier une affaire</Text>
        <Text style={styles.headerSubtitle}>Mets ton produit en avant dans le quartier</Text>
      </View>

      <ScrollView contentContainerStyle={styles.formContainer}>
        {/* Titre de l'article */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nom de l'article / Produit</Text>
          <View style={styles.inputWrapper}>
            <Tag size={18} color="#9ca3af" />
            <TextInput
              style={styles.input}
              placeholder="Ex: iPhone 13 Pro, Chaussures Nike..."
              placeholderTextColor="#9ca3af"
              value={title}
              onChangeText={setTitle}
            />
          </View>
        </View>

        {/* Prix */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Prix (en FCFA)</Text>
          <View style={styles.inputWrapper}>
            <DollarSign size={18} color="#9ca3af" />
            <TextInput
              style={styles.input}
              placeholder="Ex: 25000"
              placeholderTextColor="#9ca3af"
              keyboardValue="numeric"
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
            />
          </View>
        </View>

        {/* Quartier / Ville */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Quartier / Localisation</Text>
          <View style={styles.inputWrapper}>
            <MapPin size={18} color="#9ca3af" />
            <TextInput
              style={styles.input}
              placeholder="Ex: Akwa, Douala ou Bastos, Yaoundé"
              placeholderTextColor="#9ca3af"
              value={location}
              onChangeText={setLocation}
            />
          </View>
        </View>

        {/* Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description & Détails</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="État du produit, précision sur la livraison..."
            placeholderTextColor="#9ca3af"
            multiline={true}
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Bouton de validation */}
        <TouchableOpacity 
          style={[styles.submitButton, loading && { opacity: 0.7 }]} 
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <PlusCircle size={20} color="#ffffff" />
              <Text style={styles.submitButtonText}>Publier sur DealCity</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  formContainer: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    marginLeft: 8,
  },
  textArea: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingTop: 12,
    height: 100,
    textAlignVertical: 'top',
    marginLeft: 0,
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: '#4a90e2',
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
    shadowColor: '#4a90e2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});