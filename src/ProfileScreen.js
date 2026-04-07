import React from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';

const ProfileScreen = ({
  registeredEmail,
  newPassword,
  setNewPassword,
  confirmNewPassword,
  setConfirmNewPassword,
  profileMessage,
  setProfileMessage,
  handleChangePassword,
  setScreen,
  handleLogout,
  savedCards,
  newPaymentMethod,
  setNewPaymentMethod,
  addSavedCard,
}) => {
  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.userBanner}>
        <Text style={styles.welcomeText}>Profile Settings</Text>
        <Text style={styles.welcomeSubText}>Manage your account details.</Text>
      </View>

      <View style={styles.profileCard}>
        <Text style={styles.sectionLabel}>Account Information</Text>
        <View style={styles.infoBlock}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{registeredEmail}</Text>
        </View>

        <Text style={styles.sectionLabel}>Payment Methods</Text>
        <TextInput
          style={styles.input}
          placeholder="Add a payment method"
          placeholderTextColor="#999"
          value={newPaymentMethod}
          onChangeText={setNewPaymentMethod}
        />
        <TouchableOpacity style={styles.addButton} onPress={() => addSavedCard(newPaymentMethod)}>
          <Text style={styles.addButtonText}>Save payment method</Text>
        </TouchableOpacity>
        {savedCards.length > 0 && (
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Saved methods</Text>
            {savedCards.map(card => (
              <Text key={card} style={styles.infoValue}>{card}</Text>
            ))}
          </View>
        )}

        <Text style={styles.sectionLabel}>Change Password</Text>
        <TextInput
          style={styles.input}
          placeholder="New Password"
          placeholderTextColor="#999"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm New Password"
          placeholderTextColor="#999"
          secureTextEntry
          value={confirmNewPassword}
          onChangeText={setConfirmNewPassword}
        />
        {profileMessage ? (
          <Text
            style={[
              styles.profileMessage,
              profileMessage === 'Password changed successfully.'
                ? styles.profileMessageSuccess
                : styles.profileMessageError,
            ]}
          >
            {profileMessage}
          </Text>
        ) : null}

        <TouchableOpacity style={styles.changeButton} onPress={handleChangePassword}>
          <Text style={styles.changeButtonText}>Change Password</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actionsSection}>
        <TouchableOpacity style={styles.backButton} onPress={() => setScreen('Home')}>
          <Text style={styles.backButtonText}>Back to Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  userBanner: {
    backgroundColor: '#1f1f1f',
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
  },
  welcomeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  welcomeSubText: {
    color: '#bbb',
    fontSize: 14,
  },
  profileCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  sectionLabel: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 20,
  },
  infoBlock: {
    backgroundColor: '#272727',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  infoLabel: {
    color: '#999',
    fontSize: 14,
    marginBottom: 4,
  },
  infoValue: {
    color: '#fff',
    fontSize: 16,
  },
  input: {
    backgroundColor: '#1f1f1f',
    borderRadius: 14,
    color: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  profileMessage: {
    marginTop: 8,
    marginBottom: 10,
  },
  profileMessageSuccess: {
    color: '#4ade80',
  },
  profileMessageError: {
    color: '#fca5a5',
  },
  changeButton: {
    backgroundColor: '#2563eb',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  changeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  actionsSection: {
    marginTop: 20,
  },
  backButton: {
    backgroundColor: '#272727',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  logoutButton: {
    backgroundColor: '#dc2626',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontWeight: '700',
  },
});

export default ProfileScreen;