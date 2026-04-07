import { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  FlatList,
} from 'react-native';
import AuthScreen from './src/AuthScreen';
import HomeScreen from './src/HomeScreen';
import IncomeScreen from './src/IncomeScreen';
import ExpenseScreen from './src/ExpenseScreen';
import FriendScreen from './src/FriendScreen';
import ProfileScreen from './src/ProfileScreen';
import SplashScreen from './src/SplashScreen';
import OnboardingScreen from './src/OnboardingScreen';

const typeOptions = ['Expense', 'Income'];
const borrowTypeOptions = ['Borrowed', 'Given'];
const methodOptions = ['Visa', 'Mastercard', 'Cash', 'UPI'];

export default function App() {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedType, setSelectedType] = useState('Expense');
  const [selectedMethod, setSelectedMethod] = useState('Visa');
  const [savedCards, setSavedCards] = useState([]);
  const [newPaymentMethod, setNewPaymentMethod] = useState('');
  const [cardName, setCardName] = useState('');
  const [expenseCategories, setExpenseCategories] = useState(['Fuel', 'Food', 'Rent', 'Groceries', 'Bills']);
  const [selectedCategory, setSelectedCategory] = useState('Fuel');
  const [newExpenseCategory, setNewExpenseCategory] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseReason, setExpenseReason] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [screen, setScreen] = useState('Home');
  const [showAddForm, setShowAddForm] = useState(false);
  const [appStage, setAppStage] = useState('splash');

  const [borrowAmount, setBorrowAmount] = useState('');
  const [borrowRecipient, setBorrowRecipient] = useState('');
  const [borrowReason, setBorrowReason] = useState('');
  const [selectedBorrowType, setSelectedBorrowType] = useState('Borrowed');
  const [showBorrowForm, setShowBorrowForm] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [registeredPassword, setRegisteredPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState('register');
  const [authMessage, setAuthMessage] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [profileMessage, setProfileMessage] = useState('');

  const isGmail = email.trim().toLowerCase().endsWith('@gmail.com');

  const handleRegister = () => {
    if (!isGmail) {
      setAuthMessage('Please use a valid Gmail address.');
      return;
    }

    if (password !== confirmPassword) {
      setAuthMessage('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setAuthMessage('Password must be at least 6 characters.');
      return;
    }

    setRegisteredEmail(email.trim().toLowerCase());
    setRegisteredPassword(password);
    setAuthMode('login');
    setAuthMessage('Account created. Please sign in.');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleLogin = () => {
    if (!registeredEmail) {
      setAuthMessage('No account found. Please register first.');
      return;
    }

    if (email.trim().toLowerCase() !== registeredEmail || password !== registeredPassword) {
      setAuthMessage('Email or password does not match.');
      return;
    }

    setIsLoggedIn(true);
    setAppStage('app');
    setAuthMessage('');
    setEmail('');
    setPassword('');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setScreen('Home');
    setAppStage('auth');
    setAuthMode('login');
    setAuthMessage('');
  };

  const handleSplashFinish = () => {
    setAppStage('onboarding');
  };

  const handleBeginAuth = () => {
    setAppStage('auth');
    setAuthMode('login');
    setAuthMessage('');
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmNewPassword) {
      setProfileMessage('New passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setProfileMessage('Password must be at least 6 characters.');
      return;
    }

    setRegisteredPassword(newPassword);
    setNewPassword('');
    setConfirmNewPassword('');
    setProfileMessage('Password changed successfully.');
  };

  const addSavedCard = (name = cardName) => {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }
    if (!savedCards.includes(trimmed)) {
      setSavedCards([trimmed, ...savedCards]);
    }
    setSelectedMethod(trimmed);
    setCardName('');
    setNewPaymentMethod('');
  };

  const addExpenseCategory = () => {
    const trimmed = newExpenseCategory.trim();
    if (!trimmed) {
      return;
    }
    if (!expenseCategories.includes(trimmed)) {
      setExpenseCategories([trimmed, ...expenseCategories]);
    }
    setSelectedCategory(trimmed);
    setNewExpenseCategory('');
  };

  const addExpenseRecord = (amountValue, reason) => {
    const value = parseFloat(amountValue);
    if (!value || value <= 0) {
      return;
    }

    const newTransaction = {
      id: Date.now().toString(),
      amount: value,
      description: reason.trim() || selectedCategory || 'Expense',
      type: 'Expense',
      category: selectedCategory,
      method: selectedMethod,
      date: new Date().toLocaleDateString(),
    };

    setTransactions([newTransaction, ...transactions]);
    setExpenseAmount('');
    setExpenseReason('');
  };

  const addTransaction = () => {
    const value = parseFloat(amount);
    if (!value || value <= 0) {
      return;
    }

    const newTransaction = {
      id: Date.now().toString(),
      amount: value,
      description:
        selectedType === 'Expense'
          ? description.trim() || selectedCategory
          : description.trim() || selectedType,
      type: selectedType,
      category: selectedType === 'Expense' ? selectedCategory : '',
      method: selectedMethod,
      date: new Date().toLocaleDateString(),
    };

    setTransactions([newTransaction, ...transactions]);
    setAmount('');
    setDescription('');
    setShowAddForm(false);
  };

  const addBorrowRecord = () => {
    const value = parseFloat(borrowAmount);
    if (!value || value <= 0) {
      return;
    }

    const newTransaction = {
      id: Date.now().toString(),
      amount: value,
      recipient: borrowRecipient.trim() || 'Friend',
      description: borrowReason.trim() || selectedBorrowType,
      type: selectedBorrowType,
      method: '',
      date: new Date().toLocaleDateString(),
    };

    setTransactions([newTransaction, ...transactions]);
    setBorrowAmount('');
    setBorrowRecipient('');
    setBorrowReason('');
    setSelectedBorrowType('Borrowed');
    setShowBorrowForm(false);
  };

  const incomeTotal = transactions
    .filter(item => item.type === 'Income')
    .reduce((sum, item) => sum + item.amount, 0);

  const expenseTotal = transactions
    .filter(item => item.type === 'Expense')
    .reduce((sum, item) => sum + item.amount, 0);

  const borrowedTotal = transactions
    .filter(item => item.type === 'Borrowed')
    .reduce((sum, item) => sum + item.amount, 0);

  const givenTotal = transactions
    .filter(item => item.type === 'Given')
    .reduce((sum, item) => sum + item.amount, 0);

  const balance = incomeTotal - expenseTotal;

  const renderTransaction = ({ item }) => (
    <View
      style={[
        styles.transactionCard,
        item.type === 'Income'
          ? styles.incomeCard
          : item.type === 'Expense'
          ? styles.expenseCard
          : styles.borrowCard,
      ]}
    >
      <View style={styles.transactionHeader}>
        <Text style={styles.transactionType}>{item.type}</Text>
        <Text style={styles.transactionAmount}>${item.amount.toFixed(2)}</Text>
      </View>
      <Text style={styles.transactionDesc}>{item.description}</Text>
      <Text style={styles.transactionMeta}>
        {item.type === 'Expense'
          ? `${item.category ? `${item.category} • ` : ''}${item.method ? `${item.method} • ` : ''}${item.date}`
          : item.recipient
          ? `${item.recipient} • ${item.date}`
          : `${item.method} • ${item.date}`}
      </Text>
    </View>
  );







  if (!isLoggedIn) {
    if (appStage === 'splash') {
      return <SplashScreen onFinish={handleSplashFinish} />;
    }

    if (appStage === 'onboarding') {
      return <OnboardingScreen onStart={handleBeginAuth} />;
    }

    return (
      <SafeAreaView style={styles.safeArea}>
        <AuthScreen
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          authMode={authMode}
          setAuthMode={setAuthMode}
          authMessage={authMessage}
          setAuthMessage={setAuthMessage}
          handleRegister={handleRegister}
          handleLogin={handleLogin}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.homeHeader}>
          <Text style={styles.title}>Velora Money Tracker</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.screenTabs}>
          {['Home', 'Income', 'Expense', 'Borrow', 'Profile'].map(option => (
            <TouchableOpacity
              key={option}
              style={[styles.tabButton, screen === option && styles.activeTab]}
              onPress={() => setScreen(option)}
            >
              <Text style={[styles.tabText, screen === option && styles.activeTabText]}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {screen === 'Home' && (
          <HomeScreen
            registeredEmail={registeredEmail}
            incomeTotal={incomeTotal}
            expenseTotal={expenseTotal}
            balance={balance}
            showAddForm={showAddForm}
            setShowAddForm={setShowAddForm}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            expenseCategories={expenseCategories}
            selectedMethod={selectedMethod}
            setSelectedMethod={setSelectedMethod}
            amount={amount}
            setAmount={setAmount}
            description={description}
            setDescription={setDescription}
            addTransaction={addTransaction}
            transactions={transactions}
            renderTransaction={renderTransaction}
            savedCards={savedCards}
            cardName={cardName}
            setCardName={setCardName}
            addSavedCard={addSavedCard}
            methodOptions={methodOptions}
          />
        )}
        {screen === 'Income' && (
          <IncomeScreen
            transactions={transactions}
            renderTransaction={renderTransaction}
            setScreen={setScreen}
          />
        )}
        {screen === 'Expense' && (
          <ExpenseScreen
            transactions={transactions}
            renderTransaction={renderTransaction}
            setScreen={setScreen}
            expenseAmount={expenseAmount}
            setExpenseAmount={setExpenseAmount}
            expenseReason={expenseReason}
            setExpenseReason={setExpenseReason}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            expenseCategories={expenseCategories}
            newExpenseCategory={newExpenseCategory}
            setNewExpenseCategory={setNewExpenseCategory}
            addExpenseCategory={addExpenseCategory}
            addExpenseRecord={addExpenseRecord}
          />
        )}
        {screen === 'Borrow' && (
          <FriendScreen
            transactions={transactions}
            renderTransaction={renderTransaction}
            borrowedTotal={borrowedTotal}
            givenTotal={givenTotal}
            showBorrowForm={showBorrowForm}
            setShowBorrowForm={setShowBorrowForm}
            selectedBorrowType={selectedBorrowType}
            setSelectedBorrowType={setSelectedBorrowType}
            borrowAmount={borrowAmount}
            setBorrowAmount={setBorrowAmount}
            borrowRecipient={borrowRecipient}
            setBorrowRecipient={setBorrowRecipient}
            borrowReason={borrowReason}
            setBorrowReason={setBorrowReason}
            addBorrowRecord={addBorrowRecord}
          />
        )}
        {screen === 'Profile' && (
          <ProfileScreen
            registeredEmail={registeredEmail}
            newPassword={newPassword}
            setNewPassword={setNewPassword}
            confirmNewPassword={confirmNewPassword}
            setConfirmNewPassword={setConfirmNewPassword}
            profileMessage={profileMessage}
            setProfileMessage={setProfileMessage}
            handleChangePassword={handleChangePassword}
            setScreen={setScreen}
            handleLogout={handleLogout}
            savedCards={savedCards}
            newPaymentMethod={newPaymentMethod}
            setNewPaymentMethod={setNewPaymentMethod}
            addSavedCard={addSavedCard}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#121212',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
  },
  homeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  logoutButton: {
    backgroundColor: '#272727',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  logoutText: {
    color: '#fff',
    fontWeight: '700',
  },
  screenTabs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  tabButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#272727',
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#2563eb',
  },
  tabText: {
    color: '#ddd',
    fontWeight: '700',
  },
  activeTabText: {
    color: '#fff',
  },
  transactionCard: {
    backgroundColor: '#1f1f1f',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  incomeCard: {
    borderColor: '#4ade80',
    borderWidth: 1,
  },
  expenseCard: {
    borderColor: '#fda4af',
    borderWidth: 1,
  },
  borrowCard: {
    borderColor: '#93c5fd',
    borderWidth: 1,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  transactionType: {
    color: '#aaa',
    fontWeight: '700',
  },
  transactionAmount: {
    color: '#fff',
    fontWeight: '700',
  },
  transactionDesc: {
    color: '#ddd',
    fontSize: 15,
    marginBottom: 6,
  },
  transactionMeta: {
    color: '#777',
    fontSize: 13,
  },
});