import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const { width } = Dimensions.get('window');

interface ModernCalendarProps {
    onDateSelect: (date: string) => void;
    selectedDate?: string;
    theme: any;
    blockedDates?: string[];
}

const ModernCalendar = ({ onDateSelect, selectedDate, theme, blockedDates = [] }: ModernCalendarProps) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month, 1).getDay();
    };

    const changeMonth = (offset: number) => {
        const newDate = new Date(currentDate.setMonth(currentDate.getMonth() + offset));
        setCurrentDate(new Date(newDate));
    };

    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate);
        const totalSlots = Math.ceil((daysInMonth + firstDay) / 7) * 7;
        const grid = [];

        for (let i = 0; i < totalSlots; i++) {
            const dayNum = i - firstDay + 1;
            if (i < firstDay || dayNum > daysInMonth) {
                grid.push(<View key={i} style={styles.calendarCell} />);
            } else {
                const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                const isSelected = selectedDate === dateString;
                const isBlocked = blockedDates.includes(dateString);
                const isToday = dateString === new Date().toISOString().split('T')[0];

                grid.push(
                    <TouchableOpacity
                        key={i}
                        style={[
                            styles.calendarCell,
                            isSelected && { backgroundColor: '#A0AEC0', borderRadius: 20 }, // Gray for selected
                            isBlocked && { backgroundColor: theme.error + '40', borderRadius: 20 }, // Light red for blocked
                            isToday && !isSelected && { borderWidth: 1, borderColor: theme.primary, borderRadius: 20 }
                        ]}
                        onPress={() => onDateSelect(dateString)}
                        disabled={isBlocked}
                    >
                        <Text style={[
                            styles.dayText,
                            { color: theme.text },
                            isSelected && { color: 'white', fontWeight: 'bold' },
                            isBlocked && { color: theme.error, textDecorationLine: 'line-through' }
                        ]}>
                            {dayNum}
                        </Text>
                    </TouchableOpacity>
                );
            }
        }
        return grid;
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.cardBg }]}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.navRow}>
                    <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.navBtn}>
                        <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={theme.text} strokeWidth="2">
                            <Path d="M15 18l-6-6 6-6" />
                        </Svg>
                    </TouchableOpacity>
                    <Text style={[styles.monthTitle, { color: theme.text }]}>
                        {monthNames[currentDate.getMonth()]}
                    </Text>
                    <TouchableOpacity onPress={() => changeMonth(1)} style={styles.navBtn}>
                        <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={theme.text} strokeWidth="2">
                            <Path d="M9 18l6-6-6-6" />
                        </Svg>
                    </TouchableOpacity>
                </View>

                {/* Year Navigation */}
                <View style={styles.navRow}>
                    <TouchableOpacity onPress={() => changeMonth(-12)} style={styles.navBtn}>
                        <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={theme.subText} strokeWidth="2">
                            <Path d="M15 18l-6-6 6-6" />
                        </Svg>
                    </TouchableOpacity>
                    <Text style={[styles.yearTitle, { color: theme.subText }]}>
                        {currentDate.getFullYear()}
                    </Text>
                    <TouchableOpacity onPress={() => changeMonth(12)} style={styles.navBtn}>
                        <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={theme.subText} strokeWidth="2">
                            <Path d="M9 18l6-6-6-6" />
                        </Svg>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Days Header */}
            <View style={styles.daysHeader}>
                {days.map(day => (
                    <Text key={day} style={[styles.dayLabel, { color: theme.subText }]}>{day}</Text>
                ))}
            </View>

            {/* Grid */}
            <View style={styles.grid}>
                {renderCalendar()}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        padding: 15,
        borderRadius: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    navRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    navBtn: {
        padding: 8,
    },
    yearTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginHorizontal: 5,
    },
    monthTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginHorizontal: 5,
    },
    daysHeader: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 10,
    },
    dayLabel: {
        width: (width - 90) / 7,
        textAlign: 'center',
        fontSize: 12,
        fontWeight: '600',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    calendarCell: {
        width: (width - 90) / 7,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    dayText: {
        fontSize: 14,
        fontWeight: '500',
    },
});

export default ModernCalendar;
