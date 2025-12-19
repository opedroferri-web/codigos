// banner-frete-detector.js
// Carregue esse script UMA VEZ no <head> ou início do site
// Ele detecta o estado e salva para todos os banners usarem

(function() {
    'use strict';
    
    const CONFIG = {
        cacheKey: 'bannerFreteEstado',
        timestampKey: 'bannerFreteTimestamp',
        cacheExpiry: 24 * 60 * 60 * 1000, // 24 horas
        apiUrl: 'https://ipapi.co/json/'
    };

    const estadosParaAbreviar = [
        'Rio Grande do Norte',
        'Rio Grande do Sul',
        'Mato Grosso do Sul',
        'Mato Grosso',
        'Espírito Santo',
        'Santa Catarina',
        'São Paulo'
    ];

    const abreviacoes = {
        'Acre': 'AC',
        'Alagoas': 'AL',
        'Amapá': 'AP',
        'Amazonas': 'AM',
        'Bahia': 'BA',
        'Ceará': 'Ceará',
        'Distrito Federal': 'DF',
        'Espírito Santo': 'ES',
        'Goiás': 'GO',
        'Maranhão': 'MA',
        'Mato Grosso': 'MT',
        'Mato Grosso do Sul': 'MS',
        'Minas Gerais': 'MG',
        'Pará': 'PA',
        'Paraíba': 'PB',
        'Paraná': 'PR',
        'Pernambuco': 'PE',
        'Piauí': 'PI',
        'Rio de Janeiro': 'RJ',
        'Rio Grande do Norte': 'RN',
        'Rio Grande do Sul': 'RS',
        'Rondônia': 'RO',
        'Roraima': 'RR',
        'Santa Catarina': 'SC',
        'São Paulo': 'SP',
        'Sergipe': 'SE',
        'Tocantins': 'TO'
    };

    function isCacheValido() {
        const estadoSalvo = sessionStorage.getItem(CONFIG.cacheKey);
        const timestamp = sessionStorage.getItem(CONFIG.timestampKey);
        
        if (!estadoSalvo || !timestamp) return false;
        
        const agora = Date.now();
        return (agora - parseInt(timestamp)) < CONFIG.cacheExpiry;
    }

    function getEstadoCache() {
        return sessionStorage.getItem(CONFIG.cacheKey);
    }

    function salvarEstado(estado) {
        sessionStorage.setItem(CONFIG.cacheKey, estado);
        sessionStorage.setItem(CONFIG.timestampKey, Date.now().toString());
    }

    function formatarEstado(estadoNome) {
        if (estadosParaAbreviar.includes(estadoNome)) {
            return abreviacoes[estadoNome] || estadoNome;
        }
        return estadoNome;
    }

    async function detectarEstado() {
        // Se já tem cache válido, não faz nada
        if (isCacheValido()) {
            console.log('[Banner Frete] ✓ Estado já detectado:', getEstadoCache());
            return;
        }

        try {
            console.log('[Banner Frete] ⟳ Detectando localização...');
            
            const response = await fetch(CONFIG.apiUrl);
            const data = await response.json();
            
            const estadoNome = data.region || 'Brasil';
            const estadoFormatado = formatarEstado(estadoNome);
            
            salvarEstado(estadoFormatado);
            
            console.log('[Banner Frete] ✓ Estado detectado e salvo:', estadoFormatado);
            
            // Dispara evento customizado para os banners atualizarem
            window.dispatchEvent(new CustomEvent('bannerFreteEstadoAtualizado', {
                detail: { estado: estadoFormatado }
            }));
            
        } catch (error) {
            console.error('[Banner Frete] ✗ Erro ao detectar localização:', error);
            salvarEstado('Brasil');
        }
    }

    // API pública para os banners acessarem
    window.BannerFrete = {
        getEstado: function() {
            return getEstadoCache() || 'Brasil';
        },
        isReady: function() {
            return isCacheValido();
        }
    };

    // Detecta quando o DOM carregar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', detectarEstado);
    } else {
        detectarEstado();
    }
})();
