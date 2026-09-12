import { formatMoney, money } from '@budgetify/core';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/theme/ThemeProvider';

interface PlanItem {
  id: string;
  title: string;
  amount: number; // in cents
  dueDate: string;
  category: string;
  isDone: boolean;
  isRecurring: boolean;
}

export default function PlanningScreen(): React.ReactElement {
  const { colors, spacing, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const currency = 'USD';

  const [items, setItems] = useState<PlanItem[]>([
    {
      id: '1',
      title: 'Apartment Rent',
      amount: 120000,
      dueDate: 'Sep 01',
      category: 'Housing',
      isDone: true,
      isRecurring: true,
    },
    {
      id: '2',
      title: 'Internet & WiFi',
      amount: 6500,
      dueDate: 'Sep 15',
      category: 'Utilities',
      isDone: false,
      isRecurring: true,
    },
    {
      id: '3',
      title: 'Car Insurance Renewal',
      amount: 14000,
      dueDate: 'Sep 20',
      category: 'Transport',
      isDone: false,
      isRecurring: false,
    },
    {
      id: '4',
      title: 'Dental Checkup',
      amount: 8000,
      dueDate: 'Sep 25',
      category: 'Health',
      isDone: false,
      isRecurring: false,
    },
    {
      id: '5',
      title: 'Gym Membership',
      amount: 4500,
      dueDate: 'Sep 28',
      category: 'Fitness',
      isDone: false,
      isRecurring: true,
    },
  ]);

  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('');

  const toggleDone = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isDone: !item.isDone } : item)),
    );
  };

  const addUnplanned = () => {
    if (!newTitle.trim() || !newAmount.trim()) return;
    const amountVal = Math.round(parseFloat(newAmount) * 100);
    if (isNaN(amountVal) || amountVal <= 0) return;

    const newItem: PlanItem = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      amount: amountVal,
      dueDate: 'Today (Unplanned)',
      category: 'Unplanned',
      isDone: true,
      isRecurring: false,
    };

    setItems((prev) => [newItem, ...prev]);
    setNewTitle('');
    setNewAmount('');
  };

  const completedCount = items.filter((i) => i.isDone).length;
  const pendingTotal = items.filter((i) => !i.isDone).reduce((sum, i) => sum + i.amount, 0);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background.primary }]}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
    >
      {/* Summary Card */}
      <View
        style={[
          styles.summaryCard,
          { backgroundColor: colors.background.card, borderColor: colors.border.default },
        ]}
      >
        <View style={styles.summaryRow}>
          <View>
            <Text style={[typography.caption, { color: colors.text.tertiary }]}>
              PLANNED CHECKLIST
            </Text>
            <Text style={[typography.h3, { color: colors.text.primary, marginTop: 4 }]}>
              {completedCount} of {items.length} Done
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[typography.caption, { color: colors.text.tertiary }]}>REMAINING DUE</Text>
            <Text style={[typography.h3, { color: colors.brand.primary, marginTop: 4 }]}>
              {formatMoney(money(pendingTotal, currency))}
            </Text>
          </View>
        </View>
      </View>

      {/* Quick Add Unplanned Spend */}
      <View
        style={[
          styles.unplannedCard,
          { backgroundColor: colors.background.card, borderColor: colors.border.default },
        ]}
      >
        <Text style={[typography.h4, { color: colors.text.primary, marginBottom: 8 }]}>
          ⚡ Add Unplanned Expense
        </Text>
        <View style={styles.formRow}>
          <TextInput
            style={[
              styles.input,
              {
                flex: 2,
                backgroundColor: colors.background.primary,
                color: colors.text.primary,
                borderColor: colors.border.default,
              },
            ]}
            placeholder="Expense title"
            placeholderTextColor={colors.text.muted}
            value={newTitle}
            onChangeText={setNewTitle}
          />
          <TextInput
            style={[
              styles.input,
              {
                flex: 1,
                backgroundColor: colors.background.primary,
                color: colors.text.primary,
                borderColor: colors.border.default,
              },
            ]}
            placeholder="Amount ($)"
            placeholderTextColor={colors.text.muted}
            keyboardType="decimal-pad"
            value={newAmount}
            onChangeText={setNewAmount}
          />
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.brand.primary }]}
            onPress={addUnplanned}
          >
            <Text
              style={[typography.bodyMedium, { color: colors.text.inverse, fontWeight: '700' }]}
            >
              Add
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Checklist Items */}
      <Text
        style={[
          typography.h4,
          { color: colors.text.primary, marginTop: spacing.lg, marginBottom: spacing.sm },
        ]}
      >
        Monthly Plan & Bills
      </Text>

      {items.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={[
            styles.itemCard,
            { backgroundColor: colors.background.card, borderColor: colors.border.default },
            item.isDone && { opacity: 0.65 },
          ]}
          onPress={() => toggleDone(item.id)}
          activeOpacity={0.7}
        >
          <View style={styles.checkRow}>
            <View
              style={[
                styles.checkbox,
                { borderColor: item.isDone ? colors.brand.primary : colors.border.strong },
                item.isDone && { backgroundColor: colors.brand.primary },
              ]}
            >
              {item.isDone && <Text style={styles.checkmark}>✓</Text>}
            </View>

            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text
                style={[
                  typography.bodyLarge,
                  {
                    color: colors.text.primary,
                    fontWeight: '600',
                    textDecorationLine: item.isDone ? 'line-through' : 'none',
                  },
                ]}
              >
                {item.title}
              </Text>
              <Text style={[typography.bodySmall, { color: colors.text.tertiary, marginTop: 2 }]}>
                Due {item.dueDate} • {item.category} {item.isRecurring ? '🔄' : ''}
              </Text>
            </View>

            <Text
              style={[
                typography.bodyLarge,
                {
                  fontWeight: '700',
                  color: item.isDone ? colors.text.tertiary : colors.text.primary,
                },
              ]}
            >
              {formatMoney(money(item.amount, currency))}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  summaryCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  unplannedCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  formRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  input: {
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  addBtn: {
    paddingHorizontal: 16,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
