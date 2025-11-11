// js/statistics.js - Statistics Dashboard Logic

import { supabase } from './supabaseClient.js';

let currentUser = { id: 'anon' };
let allTrips = [];
let allReviews = [];
let allIdeas = [];
let chartInstances = {};

// ============================================================
// DATA FETCHING
// ============================================================

async function fetchAllData(timeRange = 'all') {
    try {
        // Calculate date filter
        let dateFilter = null;
        if (timeRange !== 'all') {
            const days = parseInt(timeRange);
            const date = new Date();
            date.setDate(date.getDate() - days);
            dateFilter = date.toISOString().split('T')[0];
        }
        
        // Fetch trips
        let tripsQuery = supabase
            .from('trip_history')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('trip_date', { ascending: true });
        
        if (dateFilter) {
            tripsQuery = tripsQuery.gte('trip_date', dateFilter);
        }
        
        const { data: trips, error: tripsError } = await tripsQuery;
        if (tripsError) throw tripsError;
        allTrips = trips || [];
        
        // Fetch reviews
        const { data: reviews, error: reviewsError } = await supabase
            .from('idea_reviews')
            .select('*')
            .eq('user_id', currentUser.id);
        if (reviewsError) throw reviewsError;
        allReviews = reviews || [];
        
        // Fetch ideas
        const { data: ideas, error: ideasError } = await supabase
            .from('trip_ideas_v2')
            .select('*');
        if (ideasError) throw ideasError;
        allIdeas = ideas || [];
        
        return true;
    } catch (error) {
        console.error('Error fetching data:', error);
        return false;
    }
}

// ============================================================
// CALCULATIONS
// ============================================================

function calculateSummaryCards() {
    // Total trips
    const totalTrips = allTrips.length;
    
    // Total unique places visited
    const visitedPlaceIds = new Set();
    allTrips.forEach(trip => {
        trip.selection_json.forEach(item => {
            if (item.idea_id) visitedPlaceIds.add(item.idea_id);
        });
    });
    const totalPlaces = visitedPlaceIds.size;
    
    // Average rating
    const ratingsSum = allReviews.reduce((sum, r) => sum + (r.rating || 0), 0);
    const avgRating = allReviews.length > 0 ? (ratingsSum / allReviews.length).toFixed(1) : 0;
    
    // Review completion rate
    const totalActivities = allTrips.reduce((sum, trip) => sum + trip.selection_json.length, 0);
    const reviewedActivities = allReviews.length;
    const reviewCompletion = totalActivities > 0 
        ? Math.round((reviewedActivities / totalActivities) * 100) 
        : 0;
    
    return { totalTrips, totalPlaces, avgRating, reviewCompletion };
}

function calculateTripActivity() {
    // Group trips by month
    const monthCounts = {};
    
    allTrips.forEach(trip => {
        const date = new Date(trip.trip_date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
    });
    
    // Convert to array and sort
    const sortedMonths = Object.keys(monthCounts).sort();
    const labels = sortedMonths.map(key => {
        const [year, month] = key.split('-');
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${monthNames[parseInt(month) - 1]} ${year}`;
    });
    const data = sortedMonths.map(key => monthCounts[key]);
    
    return { labels, data };
}

function calculateTopPlaces() {
    // Count visits per place
    const placeCounts = {};
    
    allTrips.forEach(trip => {
        trip.selection_json.forEach(item => {
            if (item.name) {
                const key = item.name;
                placeCounts[key] = (placeCounts[key] || 0) + 1;
            }
        });
    });
    
    // Sort and get top 10
    const sorted = Object.entries(placeCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    
    return {
        labels: sorted.map(([name]) => name),
        data: sorted.map(([, count]) => count)
    };
}

function calculateCategoryBreakdown() {
    // Count by category
    const categoryCounts = {};
    
    allTrips.forEach(trip => {
        trip.selection_json.forEach(item => {
            if (item.category) {
                categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
            }
        });
    });
    
    return {
        labels: Object.keys(categoryCounts),
        data: Object.values(categoryCounts)
    };
}

function calculateReviewQuality() {
    // Count reviews by rating
    const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    
    allReviews.forEach(review => {
        const rating = review.rating || 0;
        if (rating >= 1 && rating <= 5) {
            starCounts[rating]++;
        }
    });
    
    const total = allReviews.length || 1;
    const percentages = {};
    for (let i = 1; i <= 5; i++) {
        percentages[i] = Math.round((starCounts[i] / total) * 100);
    }
    
    return { counts: starCounts, percentages };
}

function calculateYearSummary(timeRange) {
    // Period label
    const periodLabels = {
        'all': 'All Time',
        '30': 'Last 30 Days',
        '90': 'Last 3 Months',
        '180': 'Last 6 Months',
        '365': 'This Year'
    };
    const period = periodLabels[timeRange] || 'All Time';
    
    // New places (unique places in this period)
    const placeIds = new Set();
    allTrips.forEach(trip => {
        trip.selection_json.forEach(item => {
            if (item.idea_id) placeIds.add(item.idea_id);
        });
    });
    const newPlaces = placeIds.size;
    
    // Cities visited
    const cities = new Set();
    allTrips.forEach(trip => {
        trip.selection_json.forEach(item => {
            // Assuming you have city info in selection_json or can infer
            // For now, just count unique categories as proxy
        });
    });
    const citiesCount = cities.size || '-';
    
    // Avg trip size
    const totalActivities = allTrips.reduce((sum, trip) => sum + trip.selection_json.length, 0);
    const avgTripSize = allTrips.length > 0 ? Math.round(totalActivities / allTrips.length) : 0;
    
    // Most active month
    const monthCounts = {};
    allTrips.forEach(trip => {
        const date = new Date(trip.trip_date);
        const month = date.toLocaleDateString('id-ID', { month: 'long' });
        monthCounts[month] = (monthCounts[month] || 0) + 1;
    });
    const activeMonth = Object.keys(monthCounts).length > 0
        ? Object.entries(monthCounts).sort((a, b) => b[1] - a[1])[0][0]
        : '-';
    
    // Highest rated place
    const ratingsByPlace = {};
    allReviews.forEach(review => {
        const ideaId = review.idea_id;
        if (!ratingsByPlace[ideaId]) {
            ratingsByPlace[ideaId] = { sum: 0, count: 0 };
        }
        ratingsByPlace[ideaId].sum += review.rating || 0;
        ratingsByPlace[ideaId].count++;
    });
    
    let topRatedPlace = '-';
    let highestAvg = 0;
    Object.entries(ratingsByPlace).forEach(([ideaId, data]) => {
        const avg = data.sum / data.count;
        if (avg > highestAvg) {
            highestAvg = avg;
            // Find place name from trips
            allTrips.forEach(trip => {
                const item = trip.selection_json.find(i => i.idea_id == ideaId);
                if (item) topRatedPlace = item.name;
            });
        }
    });
    
    return { period, newPlaces, citiesCount, avgTripSize, activeMonth, topRatedPlace };
}

// ============================================================
// RENDERING
// ============================================================

function renderSummaryCards(data) {
    document.getElementById('totalTrips').textContent = data.totalTrips;
    document.getElementById('totalPlaces').textContent = data.totalPlaces;
    document.getElementById('avgRating').textContent = data.avgRating;
    document.getElementById('reviewCompletion').textContent = `${data.reviewCompletion}%`;
}

function renderTripActivityChart(data) {
    const ctx = document.getElementById('tripActivityChart');
    
    // Destroy existing chart
    if (chartInstances.tripActivity) {
        chartInstances.tripActivity.destroy();
    }
    
    chartInstances.tripActivity = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Number of Trips',
                data: data.data,
                borderColor: '#03254c',
                backgroundColor: 'rgba(3, 37, 76, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            }
        }
    });
}

function renderTopPlacesChart(data) {
    const ctx = document.getElementById('topPlacesChart');
    
    if (chartInstances.topPlaces) {
        chartInstances.topPlaces.destroy();
    }
    
    chartInstances.topPlaces = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Visits',
                data: data.data,
                backgroundColor: '#03254c'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            indexAxis: 'y',
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            }
        }
    });
}

function renderCategoryChart(data) {
    const ctx = document.getElementById('categoryChart');
    
    if (chartInstances.category) {
        chartInstances.category.destroy();
    }
    
    const colors = ['#03254c', '#1a4d7a', '#4a7ba7', '#7aa8d4', '#aad4ff'];
    
    chartInstances.category = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.labels,
            datasets: [{
                data: data.data,
                backgroundColor: colors.slice(0, data.labels.length)
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

function renderReviewQuality(data) {
    const { percentages } = data;
    
    for (let i = 1; i <= 5; i++) {
        const bar = document.getElementById(`star${i}Bar`);
        const percent = document.getElementById(`star${i}Percent`);
        
        if (bar && percent) {
            bar.style.width = `${percentages[i]}%`;
            percent.textContent = `${percentages[i]}%`;
        }
    }
}

function renderYearSummary(data) {
    document.getElementById('summaryPeriod').textContent = data.period;
    document.getElementById('summaryNewPlaces').textContent = data.newPlaces;
    document.getElementById('summaryCities').textContent = data.citiesCount;
    document.getElementById('summaryAvgTripSize').textContent = data.avgTripSize;
    document.getElementById('summaryActiveMonth').textContent = data.activeMonth;
    document.getElementById('summaryTopRated').textContent = data.topRatedPlace;
}

// ============================================================
// MAIN RENDER FUNCTION
// ============================================================

async function renderStatistics(timeRange = 'all') {
    const loadingEl = document.getElementById('loadingStats');
    const contentEl = document.getElementById('statsContent');
    const noDataEl = document.getElementById('noDataMessage');
    
    // Show loading
    loadingEl.style.display = 'flex';
    contentEl.style.display = 'none';
    noDataEl.style.display = 'none';
    
    // Fetch data
    const success = await fetchAllData(timeRange);
    
    if (!success || allTrips.length === 0) {
        loadingEl.style.display = 'none';
        noDataEl.style.display = 'block';
        return;
    }
    
    // Calculate all data
    const summaryData = calculateSummaryCards();
    const tripActivityData = calculateTripActivity();
    const topPlacesData = calculateTopPlaces();
    const categoryData = calculateCategoryBreakdown();
    const reviewQualityData = calculateReviewQuality();
    const yearSummaryData = calculateYearSummary(timeRange);
    
    // Render all sections
    renderSummaryCards(summaryData);
    renderTripActivityChart(tripActivityData);
    renderTopPlacesChart(topPlacesData);
    renderCategoryChart(categoryData);
    renderReviewQuality(reviewQualityData);
    renderYearSummary(yearSummaryData);
    
    // Hide loading, show content
    loadingEl.style.display = 'none';
    contentEl.style.display = 'block';
}

// ============================================================
// EXPORT CHART AS PNG
// ============================================================

function setupExportButtons() {
    document.querySelectorAll('.export-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const chartId = e.target.dataset.chart;
            const chart = chartInstances[chartId.replace('Chart', '')];
            
            if (chart) {
                const url = chart.toBase64Image();
                const link = document.createElement('a');
                link.download = `${chartId}.png`;
                link.href = url;
                link.click();
            }
        });
    });
}

// ============================================================
// EVENT LISTENERS
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    const timeRangeFilter = document.getElementById('timeRangeFilter');
    const refreshBtn = document.getElementById('refreshStatsBtn');
    
    // Initial render
    renderStatistics();
    
    // Filter change
    if (timeRangeFilter) {
        timeRangeFilter.addEventListener('change', (e) => {
            renderStatistics(e.target.value);
        });
    }
    
    // Refresh button
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            const currentFilter = timeRangeFilter ? timeRangeFilter.value : 'all';
            renderStatistics(currentFilter);
        });
    }
    
    // Setup export buttons
    setupExportButtons();
});