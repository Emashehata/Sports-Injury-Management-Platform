
        import { createSidebar, initSidebar, setupMobileSidebar } from '../../shared/js/sidebar.js';
        import { getAllNews } from '../../services/news_services.js';
         import { requireAdmin, getCurrentUser } from '../../services/user_services.js';
        
        // Show toast function using your existing toaster
        function showToast(message, type = 'info') {
            if (window.showToastMessage) {
                window.showToastMessage(message, type);
            } else {
                console.log(`[${type}] ${message}`);
            }
        }
           
        if (!requireAdmin()) {
        window.location.href = '../../index.html';
       }
    
        console.log('مرحباً أدمن:', getCurrentUser()?.name);

        // document.getElementById('sidebar-container').innerHTML = createSidebar('dashboard');
        document.getElementById('sidebar-container').innerHTML = createSidebar('home');
        initSidebar();
        setupMobileSidebar();
        
        // Set current date
        const now = new Date();
        const currentDateElement = document.getElementById('currentDate');
        if (currentDateElement) {
            currentDateElement.textContent = now.toLocaleDateString('ar-EG', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
        
        // Temporary mock data for injuries (since API not ready yet)
        const mockInjuries = [
            { id: 1, type: 'تمزق في الرباط الصليبي', playerName: 'أحمد محمد', date: '2024-03-15', status: 'active' },
            { id: 2, type: 'التواء في الكاحل', playerName: 'محمود حسن', date: '2024-03-10', status: 'active' },
            { id: 3, type: 'شد عضلي في الفخذ', playerName: 'يوسف علي', date: '2024-03-05', status: 'healed' },
            { id: 4, type: 'كسر في الإصبع', playerName: 'عمر خالد', date: '2024-02-28', status: 'healed' },
            { id: 5, type: 'التواء في الركبة', playerName: 'سيف الدين', date: '2024-02-20', status: 'active' }
        ];
        
        async function loadDashboard() {
            try {
                // Load news
                const allNews = await getAllNews();
                const totalNewsElement = document.getElementById('totalNews');
                if (totalNewsElement) {
                    totalNewsElement.textContent = allNews.length || 0;
                }
                
                // Display recent news (last 5)
                const recentNews = allNews && allNews.length > 0 
                    ? [...allNews].reverse().slice(0, 5)
                    : [];
                
                const newsContainer = document.getElementById('recentNewsList');
                if (newsContainer) {
                    if (recentNews.length === 0) {
                        newsContainer.innerHTML = `
                            <div class="empty-state">
                                <i class="fa-regular fa-newspaper"></i>
                                <p>لا توجد أخبار حتى الآن</p>
                            </div>
                        `;
                    } else {
                        newsContainer.innerHTML = recentNews.map(news => `
                            <div class="news-item">
                                <div>
                                    <div class="news-title">${news.title?.substring(0, 45) || 'بدون عنوان'}${news.title?.length > 45 ? '...' : ''}</div>
                                    <div class="news-date">
                                        <i class="fa-regular fa-calendar" style="font-size: 0.7rem; margin-left: 4px;"></i>
                                        ${news.date || 'تاريخ غير محدد'}
                                    </div>
                                </div>
                                <i class="fa-solid fa-circle-chevron-left" style="color: var(--primary); font-size: 1.1rem;"></i>
                            </div>
                        `).join('');
                    }
                }
                
                // Load injuries (using mock data for now)
                const activeInjuriesCount = mockInjuries.filter(i => i.status === 'active').length;
                const activeInjuriesElement = document.getElementById('activeInjuries');
                if (activeInjuriesElement) {
                    activeInjuriesElement.textContent = activeInjuriesCount;
                }
                
                // Display recent injuries
                const recentInjuries = [...mockInjuries].reverse().slice(0, 5);
                const injuriesContainer = document.getElementById('recentInjuriesList');
                if (injuriesContainer) {
                    injuriesContainer.innerHTML = recentInjuries.map(injury => `
                        <div class="injury-item">
                            <div>
                                <div class="injury-type">${injury.type || 'إصابة'}</div>
                                <div class="injury-date">
                                    <i class="fa-regular fa-user" style="font-size: 0.7rem; margin-left: 4px;"></i>
                                    ${injury.playerName || 'لاعب'} 
                                    <i class="fa-regular fa-calendar" style="font-size: 0.7rem; margin-left: 4px; margin-right: 8px;"></i>
                                    ${injury.date || ''}
                                </div>
                            </div>
                            <span class="${injury.status === 'active' ? 'badge-active' : 'badge-healed'}">
                                ${injury.status === 'active' ? 'تحت العلاج' : 'تم الشفاء'}
                            </span>
                        </div>
                    `).join('');
                }
                
                // Set mock data for players and specialists
                const totalPlayersElement = document.getElementById('totalPlayers');
                const totalSpecialistsElement = document.getElementById('totalSpecialists');
                if (totalPlayersElement) totalPlayersElement.textContent = '156';
                if (totalSpecialistsElement) totalSpecialistsElement.textContent = '24';
                
                showToast('تم تحميل لوحة التحكم بنجاح', 'success');
                
            } catch (error) {
                console.error('Error loading dashboard:', error);
                showToast('حدث خطأ في تحميل البيانات', 'error');
                
                // Set fallback values
                const totalNewsElement = document.getElementById('totalNews');
                if (totalNewsElement) totalNewsElement.textContent = '0';
            }
        }
        
        function initChart() {
            const canvas = document.getElementById('injuriesChart');
            if (!canvas) return;
            
            const ctx = canvas.getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
                    datasets: [{
                        label: 'عدد الإصابات',
                        data: [12, 19, 15, 17, 14, 10],
                        borderColor: 'rgb(3, 98, 86)',
                        backgroundColor: 'rgba(3, 98, 86, 0.08)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true,
                        pointBackgroundColor: 'rgb(3, 98, 86)',
                        pointBorderColor: 'white',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            position: 'top',
                            rtl: true,
                            labels: {
                                font: {
                                    family: 'Cairo',
                                    size: 12
                                },
                                usePointStyle: true,
                                boxWidth: 8
                            }
                        },
                        tooltip: {
                            rtl: true,
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            titleFont: { family: 'Cairo', size: 13 },
                            bodyFont: { family: 'Cairo', size: 12 }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(0,0,0,0.05)'
                            },
                            ticks: {
                                stepSize: 5,
                                font: { family: 'Cairo', size: 11 }
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            },
                            ticks: {
                                font: { family: 'Cairo', size: 11 }
                            }
                        }
                    }
                }
            });
        }
        
        // Run everything when DOM is ready
        document.addEventListener('DOMContentLoaded', () => {
            loadDashboard();
            initChart();
        });
