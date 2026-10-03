/**
 * AURA Audio Labs - Flagship E-Commerce Product Experience
 * Vanilla JavaScript Cart Logic, Dynamic Pricing, Gallery & Checkout Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  // =========================================================================
  // 1. Data Models & Constants
  // =========================================================================

  const CURRENCIES = {
    USD: { code: 'USD', symbol: '$', rate: 1.0, decimals: 2 },
    EUR: { code: 'EUR', symbol: '€', rate: 0.92, decimals: 2 },
    GBP: { code: 'GBP', symbol: '£', rate: 0.79, decimals: 2 },
    INR: { code: 'INR', symbol: '₹', rate: 83.5, decimals: 0 }
  };

  const PROMO_CODES = {
    AURA20: { code: 'AURA20', type: 'percent', value: 0.20, minSubtotal: 250, label: '20% Off Spring Special' },
    WELCOME10: { code: 'WELCOME10', type: 'percent', value: 0.10, minSubtotal: 0, label: '10% Welcome Discount' },
    FREESHIP: { code: 'FREESHIP', type: 'shipping', value: 1.0, minSubtotal: 0, label: 'Free Express Shipping' },
    SAVE50: { code: 'SAVE50', type: 'fixed', value: 50.0, minSubtotal: 300, label: '$50 Off Flagship Order' }
  };

  const FLAGSHIP_PRODUCT = {
    id: 'aura-horizon-pro',
    name: 'AURA Horizon Pro ANC Headphones',
    basePrice: 299.00,
    originalBasePrice: 369.00,
    colors: {
      'cosmic-black': {
        name: 'Cosmic Black',
        img: 'assets/images/headphones-black.jpg',
        stock: 6
      },
      'platinum-silver': {
        name: 'Platinum Silver',
        img: 'assets/images/headphones-silver.jpg',
        stock: 12
      },
      'midnight-navy': {
        name: 'Midnight Navy',
        img: 'assets/images/headphones-navy.jpg',
        stock: 9
      }
    },
    editions: {
      standard: {
        id: 'standard',
        name: 'Horizon Pro',
        price: 299.00,
        originalPrice: 369.00
      },
      audiophile: {
        id: 'audiophile',
        name: 'Horizon Studio Master',
        price: 349.00,
        originalPrice: 429.00
      }
    },
    warrantyPrice: 39.00
  };

  // Seed Customer Reviews
  let customerReviews = [
    {
      id: 1,
      author: 'Marcus Vance',
      initials: 'MV',
      rating: 5,
      date: 'September 28, 2026',
      verified: true,
      headline: 'Acoustic transparency rivaling $1,000 open-backs',
      comment: 'The transient speed of the 45mm beryllium drivers is staggering. Bass extension is punchy, completely uncolored, and the ANC seamlessly removes street noise in downtown Manhattan without any ear pressure. Worth every dollar.'
    },
    {
      id: 2,
      author: 'Elena Rostova',
      initials: 'ER',
      rating: 5,
      date: 'September 22, 2026',
      verified: true,
      headline: 'Unmatched comfort for 8+ hour mastering sessions',
      comment: 'As a sound designer, comfort is non-negotiable. The memory foam cushions and ergonomic headband balance the weight effortlessly. Plus, battery life genuinely reached 58 hours on my first single charge.'
    },
    {
      id: 3,
      author: 'David K. Liu',
      initials: 'DL',
      rating: 5,
      date: 'September 15, 2026',
      verified: true,
      headline: 'The midnight navy finish with copper is breathtaking',
      comment: 'Build quality feels like high-end horology. Pair that with lossless LDAC streaming on Android and dynamic spatial head-tracking, and it is easily my favorite piece of tech this year.'
    },
    {
      id: 4,
      author: 'Sarah Jenkins',
      initials: 'SJ',
      rating: 4,
      date: 'September 04, 2026',
      verified: true,
      headline: 'Phenomenal microphone isolation for remote calls',
      comment: 'ANC is top tier and ambient mode sounds completely natural. My coworkers remarked that my voice was crystal clear during a noisy commute. Only giving 4 stars because the companion app took a moment to pair initially.'
    }
  ];

  // =========================================================================
  // 2. Application State Management
  // =========================================================================

  // Safe LocalStorage wrapper with fallback for private browsing / sandboxes
  const storage = {
    _data: {},
    getItem(key) {
      try {
        return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : (this._data[key] || null);
      } catch (e) {
        return this._data[key] || null;
      }
    },
    setItem(key, value) {
      try {
        if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
      } catch (e) {
        this._data[key] = String(value);
      }
    }
  };

  const state = {
    currency: storage.getItem('aura_currency') || 'USD',
    selectedColor: 'cosmic-black',
    selectedEdition: 'standard',
    hasWarranty: false,
    quantity: 1,
    cart: JSON.parse(storage.getItem('aura_cart') || '[]'),
    wishlist: JSON.parse(storage.getItem('aura_wishlist') || '[]'),
    activePromo: null,
    reviewFilter: 'all'
  };

  function saveCart() {
    storage.setItem('aura_cart', JSON.stringify(state.cart));
  }

  function saveWishlist() {
    storage.setItem('aura_wishlist', JSON.stringify(state.wishlist));
  }

  // =========================================================================
  // 3. Currency Conversion & Formatting Utilities
  // =========================================================================

  function formatPrice(amountUSD) {
    const cur = CURRENCIES[state.currency] || CURRENCIES.USD;
    const converted = amountUSD * cur.rate;
    if (cur.decimals === 0) {
      return `${cur.symbol}${Math.round(converted).toLocaleString()}`;
    }
    return `${cur.symbol}${converted.toFixed(2)}`;
  }

  // =========================================================================
  // 4. DOM Elements Cache
  // =========================================================================

  const elements = {
    // Header & Currency
    currencySelector: document.getElementById('currencySelector'),
    cartOpenBtn: document.getElementById('cartOpenBtn'),
    cartCount: document.getElementById('cartCount'),
    wishlistHeaderBtn: document.getElementById('wishlistHeaderBtn'),
    wishlistCount: document.getElementById('wishlistCount'),
    floatingWishlistBtn: document.getElementById('floatingWishlistBtn'),
    copyPromo: document.getElementById('copyPromo'),

    // Flagship Product Elements
    mainProductImg: document.getElementById('mainProductImg'),
    zoomLensWrapper: document.getElementById('zoomLensWrapper'),
    displayCurrentPrice: document.getElementById('displayCurrentPrice'),
    displayOriginalPrice: document.getElementById('displayOriginalPrice'),
    displayDiscountPill: document.getElementById('displayDiscountPill'),
    installmentPrice: document.getElementById('installmentPrice'),
    stockScarcity: document.getElementById('stockScarcity'),
    currentColorLabel: document.getElementById('currentColorLabel'),
    currentEditionLabel: document.getElementById('currentEditionLabel'),
    colorSwatches: document.querySelectorAll('.color-swatch'),
    thumbButtons: document.querySelectorAll('.thumb-item'),
    editionCards: document.querySelectorAll('.edition-card'),
    warrantyAddon: document.getElementById('warrantyAddon'),
    qtyDecrement: document.getElementById('qtyDecrement'),
    qtyIncrement: document.getElementById('qtyIncrement'),
    productQuantityInput: document.getElementById('productQuantityInput'),
    addToCartBtn: document.getElementById('addToCartBtn'),
    btnDynamicTotal: document.getElementById('btnDynamicTotal'),
    buyNowBtn: document.getElementById('buyNowBtn'),
    jumpToReviews: document.getElementById('jumpToReviews'),

    // Bundle Section
    bundleMainThumb: document.getElementById('bundleMainThumb'),
    bundleMainPrice: document.getElementById('bundleMainPrice'),
    bundleAddonChecks: document.querySelectorAll('.bundle-addon-check'),
    bundleDiscountedTotal: document.getElementById('bundleDiscountedTotal'),
    bundleRegularTotal: document.getElementById('bundleRegularTotal'),
    bundleSavingsText: document.getElementById('bundleSavingsText'),
    addBundleBtn: document.getElementById('addBundleBtn'),

    // Specs & Tabs
    tabButtons: document.querySelectorAll('.tab-btn'),
    tabPanels: document.querySelectorAll('.tab-panel'),
    faqAccordion: document.getElementById('faqAccordion'),

    // Reviews
    reviewsFeedGrid: document.getElementById('reviewsFeedGrid'),
    reviewFilterChips: document.querySelectorAll('.filter-chip'),
    openReviewModalBtn: document.getElementById('openReviewModalBtn'),
    reviewModal: document.getElementById('reviewModal'),
    closeReviewModal: document.getElementById('closeReviewModal'),
    writeReviewForm: document.getElementById('writeReviewForm'),
    starPicks: document.querySelectorAll('.star-pick'),
    ratingPickLabel: document.getElementById('ratingPickLabel'),

    // Related Products Quick Add
    quickAddButtons: document.querySelectorAll('.btn-quick-add'),

    // Cart Drawer
    cartOverlay: document.getElementById('cartOverlay'),
    cartCloseBtn: document.getElementById('cartCloseBtn'),
    cartDrawerCount: document.getElementById('cartDrawerCount'),
    shippingProgressText: document.getElementById('shippingProgressText'),
    shippingBarFill: document.getElementById('shippingBarFill'),
    cartItemsContainer: document.getElementById('cartItemsContainer'),
    emptyCartState: document.getElementById('emptyCartState'),
    cartFooter: document.getElementById('cartFooter'),
    promoForm: document.getElementById('promoForm'),
    promoInput: document.getElementById('promoInput'),
    promoFeedback: document.getElementById('promoFeedback'),
    cartSubtotal: document.getElementById('cartSubtotal'),
    cartDiscountRow: document.getElementById('cartDiscountRow'),
    cartDiscountLabel: document.getElementById('cartDiscountLabel'),
    cartDiscountVal: document.getElementById('cartDiscountVal'),
    shippingTitle: document.getElementById('shippingTitle'),
    cartShippingVal: document.getElementById('cartShippingVal'),
    cartTaxVal: document.getElementById('cartTaxVal'),
    cartTotalVal: document.getElementById('cartTotalVal'),
    proceedCheckoutBtn: document.getElementById('proceedCheckoutBtn'),
    checkoutBtnTotal: document.getElementById('checkoutBtnTotal'),
    clearCartBtn: document.getElementById('clearCartBtn'),
    startShoppingBtn: document.getElementById('startShoppingBtn'),

    // Checkout Modal
    checkoutModal: document.getElementById('checkoutModal'),
    closeCheckoutModal: document.getElementById('closeCheckoutModal'),
    checkoutSimForm: document.getElementById('checkoutSimForm'),
    checkoutFinalAmt: document.getElementById('checkoutFinalAmt'),
    checkoutItemsListSummary: document.getElementById('checkoutItemsListSummary'),
    orderSuccessScreen: document.getElementById('orderSuccessScreen'),
    orderIdDisplay: document.getElementById('orderIdDisplay'),
    orderSuccessReceipt: document.getElementById('orderSuccessReceipt'),
    returnToStoreBtn: document.getElementById('returnToStoreBtn'),

    // Mobile Nav
    mobileMenuToggle: document.getElementById('mobileMenuToggle'),
    mobileNavOverlay: document.getElementById('mobileNavOverlay'),
    mobileNavClose: document.getElementById('mobileNavClose'),
    mobileNavLinks: document.querySelectorAll('.mobile-nav-link'),
    mobileCurrencySelector: document.getElementById('mobileCurrencySelector'),

    // Wishlist Modal
    wishlistModal: document.getElementById('wishlistModal'),
    wishlistModalTitle: document.getElementById('wishlistModalTitle'),
    wishlistModalCount: document.getElementById('wishlistModalCount'),
    closeWishlistModal: document.getElementById('closeWishlistModal'),
    wishlistItemsList: document.getElementById('wishlistItemsList'),
    emptyWishlistState: document.getElementById('emptyWishlistState'),

    // Lightbox Modal
    lightboxModal: document.getElementById('lightboxModal'),
    closeLightboxBtn: document.getElementById('closeLightboxBtn'),
    lightboxImg: document.getElementById('lightboxImg'),
    lightboxCaption: document.getElementById('lightboxCaption'),
    lbPills: document.querySelectorAll('.lb-pill'),

    // Mobile Sticky Bar
    mobileStickyBar: document.getElementById('mobileStickyBar'),
    stickyBarThumb: document.getElementById('stickyBarThumb'),
    stickyBarVariant: document.getElementById('stickyBarVariant'),
    stickyBarPrice: document.getElementById('stickyBarPrice'),
    stickyBarAddBtn: document.getElementById('stickyBarAddBtn'),

    // Countdown Timer
    countdownHours: document.getElementById('countdownHours'),

    // Toast Container
    toastContainer: document.getElementById('toastContainer')
  };

  // =========================================================================
  // 5. Toast Notification System
  // =========================================================================

  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? '✓' : 'ℹ';
    toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(16px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // Expose to window for inline onclick handlers if needed
  window.auraApp = { showToast };

  // =========================================================================
  // 6. Dynamic Pricing Engine for Flagship Product
  // =========================================================================

  function getFlagshipUnitPriceUSD() {
    const edition = FLAGSHIP_PRODUCT.editions[state.selectedEdition];
    let unit = edition.price;
    if (state.hasWarranty) {
      unit += FLAGSHIP_PRODUCT.warrantyPrice;
    }
    return unit;
  }

  function getFlagshipOriginalUnitPriceUSD() {
    const edition = FLAGSHIP_PRODUCT.editions[state.selectedEdition];
    let original = edition.originalPrice;
    if (state.hasWarranty) {
      original += FLAGSHIP_PRODUCT.warrantyPrice;
    }
    return original;
  }

  function updateFlagshipPricingUI() {
    const unitPriceUSD = getFlagshipUnitPriceUSD();
    const originalPriceUSD = getFlagshipOriginalUnitPriceUSD();
    const totalUSD = unitPriceUSD * state.quantity;
    const savingsUSD = originalPriceUSD - unitPriceUSD;
    const savingsPct = Math.round((savingsUSD / originalPriceUSD) * 100);

    // Update Price display
    elements.displayCurrentPrice.textContent = formatPrice(unitPriceUSD);
    elements.displayOriginalPrice.textContent = formatPrice(originalPriceUSD);
    elements.displayDiscountPill.textContent = `Save ${formatPrice(savingsUSD)} (${savingsPct}% Off)`;

    // Installment (4 payments)
    const installmentUSD = totalUSD / 4;
    elements.installmentPrice.textContent = formatPrice(installmentUSD);

    // Button dynamic total
    elements.btnDynamicTotal.textContent = formatPrice(totalUSD);

    // Update Mobile Sticky Bar Price & Variant
    if (elements.stickyBarPrice) {
      elements.stickyBarPrice.textContent = formatPrice(unitPriceUSD);
    }
    if (elements.stickyBarVariant) {
      const colorName = FLAGSHIP_PRODUCT.colors[state.selectedColor]?.name || 'Cosmic Black';
      const editionName = FLAGSHIP_PRODUCT.editions[state.selectedEdition]?.name || 'Horizon Pro';
      elements.stickyBarVariant.textContent = `${colorName} • ${editionName}`;
    }

    // Update Edition Selector dynamic prices
    const edStandard = document.getElementById('editionPriceStandard');
    if (edStandard) edStandard.textContent = formatPrice(FLAGSHIP_PRODUCT.editions.standard.price);
    const edMaster = document.getElementById('editionPriceAudiophile');
    if (edMaster) edMaster.textContent = formatPrice(FLAGSHIP_PRODUCT.editions.audiophile.price);

    // Update Warranty Addon price
    const warrantyPriceEl = document.getElementById('addonWarrantyPrice');
    if (warrantyPriceEl) warrantyPriceEl.textContent = `+${formatPrice(FLAGSHIP_PRODUCT.warrantyPrice)}`;

    // Update Bundle Companion items prices
    document.querySelectorAll('.bundle-companion-price').forEach(el => {
      const usd = parseFloat(el.dataset.usd);
      if (!isNaN(usd)) el.textContent = formatPrice(usd);
    });

    // Update Bundle Main Product Price
    elements.bundleMainPrice.textContent = formatPrice(unitPriceUSD);
    updateBundlePricing();
  }

  // =========================================================================
  // 7. Interactive Image Gallery & Lightbox Inspection
  // =========================================================================

  function setProductColor(colorKey) {
    if (!FLAGSHIP_PRODUCT.colors[colorKey]) return;
    state.selectedColor = colorKey;
    const colorInfo = FLAGSHIP_PRODUCT.colors[colorKey];

    // Update Main Image & Thumbnails
    elements.mainProductImg.src = colorInfo.img;
    elements.mainProductImg.alt = `AURA Horizon Pro in ${colorInfo.name}`;
    elements.bundleMainThumb.src = colorInfo.img;

    // Update Mobile Sticky Bar Thumb & Variant
    if (elements.stickyBarThumb) elements.stickyBarThumb.src = colorInfo.img;
    if (elements.stickyBarVariant) {
      const editionName = FLAGSHIP_PRODUCT.editions[state.selectedEdition]?.name || 'Horizon Pro';
      elements.stickyBarVariant.textContent = `${colorInfo.name} • ${editionName}`;
    }

    // Update Lightbox Modal elements
    if (elements.lightboxImg) elements.lightboxImg.src = colorInfo.img;
    if (elements.lightboxCaption) {
      elements.lightboxCaption.textContent = `${colorInfo.name} • Signature 45mm Beryllium Studio Edition`;
    }
    if (elements.lbPills) {
      elements.lbPills.forEach(pill => {
        pill.classList.toggle('active', pill.dataset.color === colorKey);
      });
    }

    // Update Labels
    elements.currentColorLabel.textContent = colorInfo.name;
    elements.stockScarcity.innerHTML = `In High Demand: Only <strong>${colorInfo.stock} units</strong> left in ${colorInfo.name}`;

    // Update Color Swatches Active State
    elements.colorSwatches.forEach(swatch => {
      const isMatch = swatch.dataset.color === colorKey;
      swatch.classList.toggle('active', isMatch);
      swatch.setAttribute('aria-checked', isMatch ? 'true' : 'false');
    });

    // Update Thumbnails Active State
    elements.thumbButtons.forEach(thumb => {
      thumb.classList.toggle('active', thumb.dataset.color === colorKey);
    });
  }

  // Touch-safe Zoom Lens effect on desktop & Click-to-inspect Lightbox
  let hasTouchInteracted = false;
  window.addEventListener('touchstart', () => { hasTouchInteracted = true; }, { passive: true });

  elements.zoomLensWrapper.addEventListener('mousemove', (e) => {
    if (hasTouchInteracted) return; // Prevent trapping mobile touch gestures
    const rect = elements.zoomLensWrapper.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    elements.mainProductImg.style.transformOrigin = `${x}% ${y}%`;
    elements.mainProductImg.style.transform = 'scale(1.75)';
  });

  elements.zoomLensWrapper.addEventListener('mouseleave', () => {
    elements.mainProductImg.style.transform = 'scale(1)';
    elements.mainProductImg.style.transformOrigin = 'center center';
  });

  // Open Lightbox when clicking or tapping the main image
  elements.zoomLensWrapper.addEventListener('click', () => {
    openLightboxModal();
  });

  function openLightboxModal() {
    if (elements.lightboxModal) {
      const colorInfo = FLAGSHIP_PRODUCT.colors[state.selectedColor];
      elements.lightboxImg.src = colorInfo.img;
      if (elements.lightboxCaption) {
        elements.lightboxCaption.textContent = `${colorInfo.name} • Signature 45mm Beryllium Studio Edition`;
      }
      elements.lightboxModal.showModal();
    }
  }

  if (elements.closeLightboxBtn) {
    elements.closeLightboxBtn.addEventListener('click', () => {
      elements.lightboxModal.close();
    });
  }

  // Lightbox Pills color switcher
  if (elements.lbPills) {
    elements.lbPills.forEach(pill => {
      pill.addEventListener('click', () => {
        setProductColor(pill.dataset.color);
      });
    });
  }

  // Color Swatch Clicks
  elements.colorSwatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      setProductColor(swatch.dataset.color);
    });
  });

  // Thumbnail Clicks
  elements.thumbButtons.forEach(thumb => {
    thumb.addEventListener('click', () => {
      setProductColor(thumb.dataset.color);
    });
  });

  // Edition Selection Clicks
  elements.editionCards.forEach(card => {
    card.addEventListener('click', () => {
      const editionKey = card.dataset.edition;
      state.selectedEdition = editionKey;
      elements.editionCards.forEach(c => c.classList.toggle('active', c === card));
      elements.currentEditionLabel.textContent = FLAGSHIP_PRODUCT.editions[editionKey].name;
      updateFlagshipPricingUI();
    });
  });

  // Warranty Checkbox
  elements.warrantyAddon.addEventListener('change', (e) => {
    state.hasWarranty = e.target.checked;
    updateFlagshipPricingUI();
  });

  // Quantity Picker
  elements.qtyDecrement.addEventListener('click', () => {
    if (state.quantity > 1) {
      state.quantity -= 1;
      elements.productQuantityInput.value = state.quantity;
      updateFlagshipPricingUI();
    }
  });

  elements.qtyIncrement.addEventListener('click', () => {
    if (state.quantity < 10) {
      state.quantity += 1;
      elements.productQuantityInput.value = state.quantity;
      updateFlagshipPricingUI();
    }
  });

  // Copy Promo Pill
  if (elements.copyPromo) {
    elements.copyPromo.addEventListener('click', () => {
      navigator.clipboard.writeText('AURA20').then(() => {
        showToast('Promo code "AURA20" copied to clipboard!', 'success');
      }).catch(() => {
        showToast('Use promo code AURA20 at checkout for 20% off', 'info');
      });
    });
  }

  // =========================================================================
  // 8. Frequently Bought Together Bundle Engine
  // =========================================================================

  function updateBundlePricing() {
    let regularTotal = getFlagshipUnitPriceUSD();
    let checkedCount = 1; // Flagship headphone is always checked

    elements.bundleAddonChecks.forEach(chk => {
      if (chk.checked) {
        regularTotal += parseFloat(chk.dataset.price);
        checkedCount += 1;
      }
    });

    // 15% discount if 2 or more items selected
    const discountRate = checkedCount >= 2 ? 0.15 : 0;
    const discountedTotal = regularTotal * (1 - discountRate);
    const savings = regularTotal - discountedTotal;

    elements.bundleDiscountedTotal.textContent = formatPrice(discountedTotal);
    elements.bundleRegularTotal.textContent = formatPrice(regularTotal);

    if (savings > 0) {
      elements.bundleSavingsText.textContent = `You save ${formatPrice(savings)} with this bundle!`;
      elements.bundleSavingsText.style.display = 'block';
    } else {
      elements.bundleSavingsText.style.display = 'none';
    }
  }

  elements.bundleAddonChecks.forEach(chk => {
    chk.addEventListener('change', updateBundlePricing);
  });

  // Add Entire Bundle to Cart
  elements.addBundleBtn.addEventListener('click', () => {
    let checkedCount = 1;
    elements.bundleAddonChecks.forEach(chk => { if (chk.checked) checkedCount++; });
    const isDiscounted = checkedCount >= 2;
    const discountMultiplier = isDiscounted ? 0.85 : 1.0;

    // 1. Add Main Headphones with bundle pricing
    const colorInfo = FLAGSHIP_PRODUCT.colors[state.selectedColor];
    const editionInfo = FLAGSHIP_PRODUCT.editions[state.selectedEdition];
    const unitPrice = getFlagshipUnitPriceUSD() * discountMultiplier;
    const originalPrice = getFlagshipOriginalUnitPriceUSD();

    const cartItemId = `${FLAGSHIP_PRODUCT.id}-${state.selectedColor}-${state.selectedEdition}-${isDiscounted ? 'bundle' : 'single'}`;
    let variantTitle = `${colorInfo.name} • ${editionInfo.name}`;
    if (isDiscounted) {
      variantTitle += ' (15% Bundle Discount)';
    }

    addItemToCart({
      id: cartItemId,
      productId: FLAGSHIP_PRODUCT.id,
      name: FLAGSHIP_PRODUCT.name,
      variant: variantTitle,
      priceUSD: unitPrice,
      originalPriceUSD: originalPrice,
      quantity: 1,
      image: colorInfo.img,
      hasWarranty: false
    });

    // 2. Add Checked Companions with bundle pricing
    elements.bundleAddonChecks.forEach(chk => {
      if (chk.checked) {
        const itemBasePrice = parseFloat(chk.dataset.price);
        const itemFinalPrice = itemBasePrice * discountMultiplier;
        addItemToCart({
          id: `${chk.id}-${isDiscounted ? 'bundle' : 'single'}`,
          name: chk.dataset.name,
          variant: isDiscounted ? 'Curated Companion (15% Bundle Savings)' : 'Standard Edition',
          priceUSD: itemFinalPrice,
          originalPriceUSD: itemBasePrice,
          quantity: 1,
          image: chk.dataset.img
        });
      }
    });

    openCartDrawer();
    showToast(isDiscounted ? 'Curated 15% Off bundle added to your bag!' : 'Selected bundle items added to bag!', 'success');
  });

  // =========================================================================
  // 9. Shopping Cart Logic & Calculations
  // =========================================================================

  function addFlagshipToCart(qty = state.quantity) {
    const colorInfo = FLAGSHIP_PRODUCT.colors[state.selectedColor];
    const editionInfo = FLAGSHIP_PRODUCT.editions[state.selectedEdition];
    const unitPrice = getFlagshipUnitPriceUSD();
    const originalPrice = getFlagshipOriginalUnitPriceUSD();

    const cartItemId = `${FLAGSHIP_PRODUCT.id}-${state.selectedColor}-${state.selectedEdition}-${state.hasWarranty ? 'care' : 'std'}`;

    let variantTitle = `${colorInfo.name} • ${editionInfo.name}`;
    if (state.hasWarranty) {
      variantTitle += ' + AURA Care+';
    }

    addItemToCart({
      id: cartItemId,
      productId: FLAGSHIP_PRODUCT.id,
      name: FLAGSHIP_PRODUCT.name,
      variant: variantTitle,
      priceUSD: unitPrice,
      originalPriceUSD: originalPrice,
      quantity: qty,
      image: colorInfo.img,
      hasWarranty: state.hasWarranty
    });
  }

  function addItemToCart(item) {
    const existingIndex = state.cart.findIndex(i => i.id === item.id);
    if (existingIndex > -1) {
      state.cart[existingIndex].quantity += item.quantity;
    } else {
      state.cart.push({ ...item });
    }
    saveCart();
    renderCart();
    animateCartBadge();
  }

  function updateItemQuantity(itemId, newQty) {
    const itemIndex = state.cart.findIndex(i => i.id === itemId);
    if (itemIndex > -1) {
      if (newQty <= 0) {
        state.cart.splice(itemIndex, 1);
        showToast('Item removed from your bag', 'info');
      } else {
        state.cart[itemIndex].quantity = newQty;
      }
      saveCart();
      renderCart();
    }
  }

  function clearCart() {
    if (state.cart.length === 0) return;
    state.cart = [];
    state.activePromo = null;
    saveCart();
    renderCart();
    showToast('Your bag has been emptied', 'info');
  }

  function calculateCartTotals() {
    const subtotalUSD = state.cart.reduce((sum, item) => sum + (item.priceUSD * item.quantity), 0);

    // Free shipping threshold: $150 USD
    const freeShippingThresholdUSD = 150.00;
    let shippingUSD = subtotalUSD > 0 ? (subtotalUSD >= freeShippingThresholdUSD ? 0 : 15.00) : 0;

    // Promo calculation
    let discountUSD = 0;
    if (state.activePromo && subtotalUSD > 0) {
      const promo = state.activePromo;
      if (subtotalUSD >= promo.minSubtotal) {
        if (promo.type === 'percent') {
          discountUSD = subtotalUSD * promo.value;
        } else if (promo.type === 'fixed') {
          discountUSD = Math.min(subtotalUSD, promo.value);
        } else if (promo.type === 'shipping') {
          shippingUSD = 0;
        }
      }
    }

    const discountedSubtotal = Math.max(0, subtotalUSD - discountUSD);
    const taxRate = 0.085; // 8.5%
    const taxUSD = discountedSubtotal * taxRate;
    const totalUSD = discountedSubtotal + shippingUSD + taxUSD;

    return {
      subtotalUSD,
      discountUSD,
      shippingUSD,
      taxUSD,
      totalUSD,
      freeShippingThresholdUSD
    };
  }

  function renderCart() {
    const totalCount = state.cart.reduce((sum, i) => sum + i.quantity, 0);

    // Update Header Counter & Drawer Title Counter
    elements.cartCount.textContent = totalCount;
    elements.cartDrawerCount.textContent = `(${totalCount} item${totalCount === 1 ? '' : 's'})`;

    const {
      subtotalUSD,
      discountUSD,
      shippingUSD,
      taxUSD,
      totalUSD,
      freeShippingThresholdUSD
    } = calculateCartTotals();

    // Toggle Empty State vs Populated Items
    if (state.cart.length === 0) {
      elements.cartItemsContainer.style.display = 'none';
      elements.emptyCartState.style.display = 'flex';
      elements.cartFooter.style.display = 'none';
      elements.shippingProgressText.textContent = `Add ${formatPrice(freeShippingThresholdUSD)} more to unlock Free Express Shipping!`;
      elements.shippingBarFill.style.width = '0%';
      return;
    }

    elements.cartItemsContainer.style.display = 'flex';
    elements.emptyCartState.style.display = 'none';
    elements.cartFooter.style.display = 'flex';

    // Free shipping bar calculation
    const progressPct = Math.min(100, Math.round((subtotalUSD / freeShippingThresholdUSD) * 100));
    elements.shippingBarFill.style.width = `${progressPct}%`;
    if (subtotalUSD >= freeShippingThresholdUSD || (state.activePromo && state.activePromo.type === 'shipping')) {
      elements.shippingProgressText.innerHTML = '🎉 You unlocked <strong>Free Global Express Shipping!</strong>';
      elements.shippingBarFill.style.background = '#10b981';
    } else {
      const remainingUSD = freeShippingThresholdUSD - subtotalUSD;
      elements.shippingProgressText.innerHTML = `Add <strong>${formatPrice(remainingUSD)}</strong> more for <strong>Free Express Shipping!</strong>`;
      elements.shippingBarFill.style.background = 'var(--accent-gradient)';
    }

    // Render Items
    elements.cartItemsContainer.innerHTML = '';
    state.cart.forEach(item => {
      const itemEl = document.createElement('div');
      itemEl.className = 'cart-item-card';
      itemEl.innerHTML = `
        <img src="${item.image}" alt="${item.name}" class="cart-item-img">
        <div class="cart-item-info">
          <h4 class="cart-item-title">${item.name}</h4>
          <span class="cart-item-variant">${item.variant}</span>
          <span class="cart-item-price">${formatPrice(item.priceUSD)}</span>
        </div>
        <div class="cart-item-actions">
          <button class="cart-item-remove" data-id="${item.id}" aria-label="Remove item">✕</button>
          <div class="cart-item-qty">
            <button class="cart-qty-btn-minus" data-id="${item.id}">−</button>
            <span>${item.quantity}</span>
            <button class="cart-qty-btn-plus" data-id="${item.id}">+</button>
          </div>
        </div>
      `;

      // Event listeners for item buttons
      itemEl.querySelector('.cart-item-remove').addEventListener('click', () => {
        updateItemQuantity(item.id, 0);
      });
      itemEl.querySelector('.cart-qty-btn-minus').addEventListener('click', () => {
        updateItemQuantity(item.id, item.quantity - 1);
      });
      itemEl.querySelector('.cart-qty-btn-plus').addEventListener('click', () => {
        updateItemQuantity(item.id, item.quantity + 1);
      });

      elements.cartItemsContainer.appendChild(itemEl);
    });

    // Update Totals UI
    elements.cartSubtotal.textContent = formatPrice(subtotalUSD);

    if (discountUSD > 0) {
      elements.cartDiscountRow.style.display = 'flex';
      elements.cartDiscountLabel.textContent = state.activePromo.code;
      elements.cartDiscountVal.textContent = `-${formatPrice(discountUSD)}`;
    } else {
      elements.cartDiscountRow.style.display = 'none';
    }

    if (shippingUSD === 0) {
      elements.cartShippingVal.innerHTML = '<span style="color: #34d399; font-weight: 700;">FREE</span>';
    } else {
      elements.cartShippingVal.textContent = formatPrice(shippingUSD);
    }

    elements.cartTaxVal.textContent = formatPrice(taxUSD);
    elements.cartTotalVal.textContent = formatPrice(totalUSD);
    elements.checkoutBtnTotal.textContent = formatPrice(totalUSD);
  }

  function animateCartBadge() {
    elements.cartCount.classList.add('bump');
    setTimeout(() => elements.cartCount.classList.remove('bump'), 300);
  }

  // Open & Close Cart Drawer
  function openCartDrawer() {
    renderCart();
    elements.cartOverlay.classList.add('open');
    elements.cartOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeCartDrawer() {
    elements.cartOverlay.classList.remove('open');
    elements.cartOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  elements.cartOpenBtn.addEventListener('click', openCartDrawer);
  elements.cartCloseBtn.addEventListener('click', closeCartDrawer);
  elements.cartOverlay.addEventListener('click', (e) => {
    if (e.target === elements.cartOverlay) {
      closeCartDrawer();
    }
  });

  elements.clearCartBtn.addEventListener('click', clearCart);
  elements.startShoppingBtn.addEventListener('click', () => {
    closeCartDrawer();
    window.location.hash = 'flagship';
  });

  // Add To Cart Button in Main Hero
  elements.addToCartBtn.addEventListener('click', () => {
    addFlagshipToCart();
    openCartDrawer();
    showToast(`Added ${state.quantity}x ${FLAGSHIP_PRODUCT.name} to your bag!`, 'success');
  });

  // Buy Now Instant Checkout Trigger
  elements.buyNowBtn.addEventListener('click', () => {
    addFlagshipToCart();
    openCheckoutModal();
    showToast(`Proceeding to instant checkout for ${FLAGSHIP_PRODUCT.name}`, 'info');
  });

  // Related Products Quick Add
  elements.quickAddButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.related-card');
      const id = card.dataset.id;
      const name = card.dataset.name;
      const priceUSD = parseFloat(card.dataset.price);
      const img = card.dataset.img;

      addItemToCart({
        id: `related-${id}`,
        name: name,
        variant: 'Standard Edition',
        priceUSD: priceUSD,
        originalPriceUSD: priceUSD,
        quantity: 1,
        image: img
      });

      openCartDrawer();
      showToast(`Added ${name} to your bag!`, 'success');
    });
  });

  // Promo Code Validation
  elements.promoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const code = elements.promoInput.value.trim().toUpperCase();
    const promo = PROMO_CODES[code];

    if (!promo) {
      elements.promoFeedback.className = 'promo-feedback error';
      elements.promoFeedback.textContent = 'Invalid promo code. Try AURA20 or WELCOME10';
      return;
    }

    const { subtotalUSD } = calculateCartTotals();
    if (subtotalUSD < promo.minSubtotal) {
      elements.promoFeedback.className = 'promo-feedback error';
      elements.promoFeedback.textContent = `Requires a minimum subtotal of ${formatPrice(promo.minSubtotal)}`;
      return;
    }

    state.activePromo = promo;
    elements.promoFeedback.className = 'promo-feedback success';
    elements.promoFeedback.textContent = `Applied: ${promo.label}`;
    renderCart();
    showToast(`Promo ${code} applied successfully!`, 'success');
  });

  // =========================================================================
  // 10. Checkout Simulation Flow & Order Confirmation
  // =========================================================================

  function openCheckoutModal() {
    closeCartDrawer();
    const { totalUSD } = calculateCartTotals();

    if (state.cart.length === 0) {
      showToast('Your bag is empty. Please select a product first.', 'info');
      return;
    }

    elements.checkoutFinalAmt.textContent = formatPrice(totalUSD);
    const itemsSummary = state.cart.map(i => `${i.quantity}x ${i.name} (${i.variant})`).join(', ');
    elements.checkoutItemsListSummary.textContent = itemsSummary;

    // Reset to step 1 form
    elements.checkoutSimForm.style.display = 'block';
    elements.orderSuccessScreen.style.display = 'none';

    elements.checkoutModal.showModal();
  }

  elements.proceedCheckoutBtn.addEventListener('click', openCheckoutModal);
  elements.closeCheckoutModal.addEventListener('click', () => elements.checkoutModal.close());

  elements.checkoutSimForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const firstName = document.getElementById('checkoutFirstName').value;
    const lastName = document.getElementById('checkoutLastName').value;
    const email = document.getElementById('checkoutEmail').value;
    const address = document.getElementById('checkoutAddress').value;

    const { totalUSD, subtotalUSD, taxUSD, shippingUSD } = calculateCartTotals();
    const orderNumber = `#AUR-${Math.floor(100000 + Math.random() * 900000)}`;

    // Build Receipt HTML
    let receiptHtml = `
      <p style="margin-bottom: 8px;"><strong>Deliver to:</strong> ${firstName} ${lastName}</p>
      <p style="margin-bottom: 8px;"><strong>Address:</strong> ${address}</p>
      <p style="margin-bottom: 12px;"><strong>Notification Email:</strong> ${email}</p>
      <div style="border-top: 1px solid var(--border-subtle); padding-top: 10px; margin-top: 8px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span>Subtotal</span>
          <span>${formatPrice(subtotalUSD)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span>Shipping</span>
          <span>${shippingUSD === 0 ? 'FREE' : formatPrice(shippingUSD)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span>Taxes</span>
          <span>${formatPrice(taxUSD)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-weight: 800; font-size: 1rem; color: #fff; margin-top: 8px; border-top: 1px solid var(--border-subtle); padding-top: 8px;">
          <span>Total Paid</span>
          <span>${formatPrice(totalUSD)}</span>
        </div>
      </div>
    `;

    elements.orderIdDisplay.textContent = orderNumber;
    elements.orderSuccessReceipt.innerHTML = receiptHtml;

    // Switch to confirmation view
    elements.checkoutSimForm.style.display = 'none';
    elements.orderSuccessScreen.style.display = 'block';

    // Clear cart on successful order
    state.cart = [];
    state.activePromo = null;
    saveCart();
    renderCart();

    showToast(`Order confirmed! Thank you, ${firstName}.`, 'success');
  });

  elements.returnToStoreBtn.addEventListener('click', () => {
    elements.checkoutModal.close();
  });

  // =========================================================================
  // 11. Wishlist System
  // =========================================================================

  // Helper lookup for products in store
  function getProductDetails(productId) {
    if (productId === FLAGSHIP_PRODUCT.id) {
      const colorInfo = FLAGSHIP_PRODUCT.colors[state.selectedColor];
      const editionInfo = FLAGSHIP_PRODUCT.editions[state.selectedEdition];
      return {
        id: productId,
        name: FLAGSHIP_PRODUCT.name,
        variant: `${colorInfo.name} • ${editionInfo.name}`,
        priceUSD: getFlagshipUnitPriceUSD(),
        image: colorInfo.img,
        isFlagship: true
      };
    }
    const relatedMap = {
      'aurabuds-pro': {
        id: 'related-aurabuds-pro',
        name: 'AURA Pods Pro Wireless Earbuds',
        variant: 'Standard Edition',
        priceUSD: 179,
        image: 'assets/images/product-earbuds.jpg',
        isFlagship: false
      },
      'stand-aluminum': {
        id: 'related-stand-aluminum',
        name: 'Precision Aluminum Stand',
        variant: 'Standard Edition',
        priceUSD: 49,
        image: 'assets/images/accessory-stand.jpg',
        isFlagship: false
      },
      'case-carbon': {
        id: 'related-case-carbon',
        name: 'Carbon Fiber Hard Case',
        variant: 'Standard Edition',
        priceUSD: 39,
        image: 'assets/images/accessory-case.jpg',
        isFlagship: false
      }
    };
    return relatedMap[productId] || null;
  }

  function isProductInWishlist(productId) {
    return state.wishlist.includes(productId);
  }

  function toggleWishlist(productId = FLAGSHIP_PRODUCT.id) {
    const idx = state.wishlist.indexOf(productId);
    if (idx > -1) {
      state.wishlist.splice(idx, 1);
      showToast('Removed from your Wishlist', 'info');
    } else {
      state.wishlist.push(productId);
      showToast('Saved to your Wishlist!', 'success');
    }
    saveWishlist();
    updateWishlistUI();
    renderWishlistModal();
  }

  function renderWishlistModal() {
    if (!elements.wishlistModal) return;
    const count = state.wishlist.length;
    if (elements.wishlistModalCount) {
      elements.wishlistModalCount.textContent = `(${count} item${count === 1 ? '' : 's'})`;
    }

    if (count === 0) {
      if (elements.wishlistItemsList) elements.wishlistItemsList.style.display = 'none';
      if (elements.emptyWishlistState) elements.emptyWishlistState.style.display = 'flex';
      return;
    }

    if (elements.wishlistItemsList) elements.wishlistItemsList.style.display = 'flex';
    if (elements.emptyWishlistState) elements.emptyWishlistState.style.display = 'none';

    elements.wishlistItemsList.innerHTML = '';
    state.wishlist.forEach(id => {
      const prod = getProductDetails(id);
      if (!prod) return;

      const itemCard = document.createElement('div');
      itemCard.className = 'wishlist-item-card';
      itemCard.innerHTML = `
        <img src="${prod.image}" alt="${prod.name}" class="wishlist-item-img">
        <div class="wishlist-item-details">
          <h4 class="wishlist-item-title">${prod.name}</h4>
          <span class="wishlist-item-variant">${prod.variant}</span>
          <span class="wishlist-item-price">${formatPrice(prod.priceUSD)}</span>
        </div>
        <div class="wishlist-item-actions">
          <button class="btn-move-to-cart" data-id="${id}">Move to Bag</button>
          <button class="btn-remove-wishlist" data-id="${id}" aria-label="Remove from Wishlist">✕ Remove</button>
        </div>
      `;

      itemCard.querySelector('.btn-move-to-cart').addEventListener('click', () => {
        if (prod.isFlagship) {
          addFlagshipToCart(1);
        } else {
          addItemToCart({
            id: prod.id,
            name: prod.name,
            variant: prod.variant,
            priceUSD: prod.priceUSD,
            originalPriceUSD: prod.priceUSD,
            quantity: 1,
            image: prod.image
          });
        }
        toggleWishlist(id);
        elements.wishlistModal.close();
        openCartDrawer();
        showToast(`Moved ${prod.name} to your bag!`, 'success');
      });

      itemCard.querySelector('.btn-remove-wishlist').addEventListener('click', () => {
        toggleWishlist(id);
      });

      elements.wishlistItemsList.appendChild(itemCard);
    });
  }

  function openWishlistModal() {
    renderWishlistModal();
    if (elements.wishlistModal) {
      elements.wishlistModal.showModal();
    }
  }

  function updateWishlistUI() {
    const count = state.wishlist.length;
    elements.wishlistCount.textContent = count;
    elements.wishlistCount.classList.add('bump');
    setTimeout(() => elements.wishlistCount.classList.remove('bump'), 300);

    const isFlagshipSaved = isProductInWishlist(FLAGSHIP_PRODUCT.id);
    elements.floatingWishlistBtn.classList.toggle('active', isFlagshipSaved);
    elements.wishlistHeaderBtn.classList.toggle('active', count > 0);
  }

  elements.floatingWishlistBtn.addEventListener('click', () => toggleWishlist());
  elements.wishlistHeaderBtn.addEventListener('click', openWishlistModal);

  if (elements.closeWishlistModal) {
    elements.closeWishlistModal.addEventListener('click', () => {
      elements.wishlistModal.close();
    });
  }

  // =========================================================================
  // 12. Tabs & FAQ Accordion System
  // =========================================================================

  elements.tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabTarget = btn.dataset.tab;
      elements.tabButtons.forEach(b => {
        b.classList.toggle('active', b === btn);
        b.setAttribute('aria-selected', b === btn ? 'true' : 'false');
      });
      elements.tabPanels.forEach(p => {
        p.classList.toggle('active', p.id === tabTarget);
      });
    });
  });

  // FAQ Accordion
  if (elements.faqAccordion) {
    elements.faqAccordion.addEventListener('click', (e) => {
      const questionBtn = e.target.closest('.faq-question');
      if (!questionBtn) return;
      const faqItem = questionBtn.closest('.faq-item');
      const isOpen = faqItem.classList.contains('open');

      // Close other items
      elements.faqAccordion.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('open');
        item.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        item.querySelector('.faq-answer').style.maxHeight = null;
      });

      if (!isOpen) {
        faqItem.classList.add('open');
        questionBtn.setAttribute('aria-expanded', 'true');
        const answer = faqItem.querySelector('.faq-answer');
        answer.style.maxHeight = answer.scrollHeight + 30 + 'px';
      }
    });
  }

  // Jump to reviews link
  elements.jumpToReviews.addEventListener('click', () => {
    const reviewsEl = document.getElementById('reviewsSection');
    if (reviewsEl) {
      reviewsEl.scrollIntoView({ behavior: 'smooth' });
    }
  });

  // =========================================================================
  // 13. Customer Reviews Feed & Interactive Submission
  // =========================================================================

  function renderReviews() {
    let filtered = customerReviews;
    if (state.reviewFilter === '5') {
      filtered = customerReviews.filter(r => r.rating === 5);
    } else if (state.reviewFilter === '4') {
      filtered = customerReviews.filter(r => r.rating === 4);
    } else if (state.reviewFilter === 'verified') {
      filtered = customerReviews.filter(r => r.verified);
    }

    elements.reviewsFeedGrid.innerHTML = '';
    filtered.forEach(rev => {
      const card = document.createElement('div');
      card.className = 'review-card';
      const starsStr = '★'.repeat(rev.rating) + '☆'.repeat(5 - rev.rating);

      card.innerHTML = `
        <div class="review-author-row">
          <div class="author-meta">
            <div class="author-avatar">${rev.initials}</div>
            <div>
              <span class="author-name">${rev.author}</span>
              ${rev.verified ? '<div class="verified-badge"><span>✓</span> Verified Buyer</div>' : ''}
            </div>
          </div>
          <span class="review-date">${rev.date}</span>
        </div>
        <div class="stars">${starsStr}</div>
        <h4 class="review-headline">${rev.headline}</h4>
        <p class="review-body-text">${rev.comment}</p>
      `;
      elements.reviewsFeedGrid.appendChild(card);
    });
  }

  elements.reviewFilterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      elements.reviewFilterChips.forEach(c => c.classList.toggle('active', c === chip));
      state.reviewFilter = chip.dataset.filter;
      renderReviews();
    });
  });

  // Write Review Modal
  let selectedReviewRating = 5;
  elements.openReviewModalBtn.addEventListener('click', () => {
    elements.reviewModal.showModal();
  });
  elements.closeReviewModal.addEventListener('click', () => {
    elements.reviewModal.close();
  });

  elements.starPicks.forEach(star => {
    star.addEventListener('click', () => {
      selectedReviewRating = parseInt(star.dataset.rating, 10);
      elements.starPicks.forEach(s => {
        s.classList.toggle('active', parseInt(s.dataset.rating, 10) <= selectedReviewRating);
      });
      elements.ratingPickLabel.textContent = `${selectedReviewRating} out of 5 stars`;
    });
  });

  elements.writeReviewForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('reviewerName').value.trim();
    const title = document.getElementById('reviewerTitle').value.trim();
    const comment = document.getElementById('reviewerComment').value.trim();

    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'AU';

    customerReviews.unshift({
      id: Date.now(),
      author: name,
      initials: initials,
      rating: selectedReviewRating,
      date: 'Today',
      verified: true,
      headline: title,
      comment: comment
    });

    elements.writeReviewForm.reset();
    elements.reviewModal.close();
    renderReviews();
    showToast('Your verified review was submitted! Thank you.', 'success');
  });

  // =========================================================================
  // 14. Currency Switcher Listener
  // =========================================================================

  elements.currencySelector.value = state.currency;
  if (elements.mobileCurrencySelector) {
    elements.mobileCurrencySelector.value = state.currency;
  }

  function handleCurrencyChange(newCurrency) {
    state.currency = newCurrency;
    storage.setItem('aura_currency', state.currency);

    elements.currencySelector.value = state.currency;
    if (elements.mobileCurrencySelector) {
      elements.mobileCurrencySelector.value = state.currency;
    }

    // Re-render everything with new currency rates
    updateFlagshipPricingUI();
    renderCart();
    renderWishlistModal();

    // Re-render related product cards
    document.querySelectorAll('.related-price').forEach(el => {
      const usd = parseFloat(el.dataset.usd);
      if (!isNaN(usd)) {
        el.textContent = formatPrice(usd);
      }
    });

    showToast(`Currency switched to ${state.currency} (${CURRENCIES[state.currency].symbol})`, 'info');
  }

  elements.currencySelector.addEventListener('change', (e) => {
    handleCurrencyChange(e.target.value);
  });

  if (elements.mobileCurrencySelector) {
    elements.mobileCurrencySelector.addEventListener('change', (e) => {
      handleCurrencyChange(e.target.value);
    });
  }

  // =========================================================================
  // 15. Mobile Navigation Drawer Controller
  // =========================================================================

  function initMobileNav() {
    if (!elements.mobileMenuToggle || !elements.mobileNavOverlay) return;

    function openMobileMenu() {
      elements.mobileMenuToggle.classList.add('active');
      elements.mobileMenuToggle.setAttribute('aria-expanded', 'true');
      elements.mobileNavOverlay.classList.add('open');
      elements.mobileNavOverlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeMobileMenu() {
      elements.mobileMenuToggle.classList.remove('active');
      elements.mobileMenuToggle.setAttribute('aria-expanded', 'false');
      elements.mobileNavOverlay.classList.remove('open');
      elements.mobileNavOverlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    elements.mobileMenuToggle.addEventListener('click', () => {
      const isOpen = elements.mobileNavOverlay.classList.contains('open');
      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });

    if (elements.mobileNavClose) {
      elements.mobileNavClose.addEventListener('click', closeMobileMenu);
    }

    elements.mobileNavOverlay.addEventListener('click', (e) => {
      if (e.target === elements.mobileNavOverlay) {
        closeMobileMenu();
      }
    });

    // Close and smooth-scroll on link click
    if (elements.mobileNavLinks) {
      elements.mobileNavLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          closeMobileMenu();
          const targetId = link.getAttribute('href');
          if (targetId && targetId.startsWith('#')) {
            e.preventDefault();
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
              targetEl.scrollIntoView({ behavior: 'smooth' });
            }
          }
        });
      });
    }
  }

  // =========================================================================
  // 16. Mobile Sticky Bottom Purchase Bar Controller
  // =========================================================================

  function initMobileStickyBar() {
    if (!elements.mobileStickyBar || !elements.addToCartBtn) return;

    if (typeof IntersectionObserver !== 'undefined') {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          // If main button has scrolled above the viewport, show sticky bar
          if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
            elements.mobileStickyBar.classList.add('visible');
          } else {
            elements.mobileStickyBar.classList.remove('visible');
          }
        });
      }, { threshold: 0.1 });

      observer.observe(elements.addToCartBtn);
    } else {
      // Fallback scroll listener for browsers without IntersectionObserver
      window.addEventListener('scroll', () => {
        const rect = elements.addToCartBtn.getBoundingClientRect();
        if (rect.top < 0) {
          elements.mobileStickyBar.classList.add('visible');
        } else {
          elements.mobileStickyBar.classList.remove('visible');
        }
      }, { passive: true });
    }

    if (elements.stickyBarAddBtn) {
      elements.stickyBarAddBtn.addEventListener('click', () => {
        addFlagshipToCart();
        openCartDrawer();
        showToast(`Added ${state.quantity}x ${FLAGSHIP_PRODUCT.name} to your bag!`, 'success');
      });
    }
  }

  // =========================================================================
  // 17. Real-Time Shipping Countdown Timer
  // =========================================================================

  function startLiveCountdown() {
    if (!elements.countdownHours) return;
    let totalSeconds = 4 * 3600 + 31 * 60 + 45;

    function tick() {
      if (totalSeconds > 0) totalSeconds--;
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      elements.countdownHours.textContent =
        `${String(hours).padStart(2, '0')} hrs ${String(minutes).padStart(2, '0')} mins ${String(seconds).padStart(2, '0')} secs`;
    }

    setInterval(tick, 1000);
    tick();
  }

  // =========================================================================
  // 18. Initial Page Initialization
  // =========================================================================

  function init() {
    setProductColor(state.selectedColor);
    updateFlagshipPricingUI();
    updateWishlistUI();
    renderCart();
    renderReviews();
    initMobileNav();
    initMobileStickyBar();
    startLiveCountdown();

    // Update Related Products prices to match initial currency
    document.querySelectorAll('.related-price').forEach(el => {
      const usd = parseFloat(el.dataset.usd);
      if (!isNaN(usd)) {
        el.textContent = formatPrice(usd);
      }
    });

    // Dynamic Delivery Date calculation (3 days from now)
    const targetDateEl = document.getElementById('deliveryTargetDate');
    if (targetDateEl) {
      const d = new Date();
      d.setDate(d.getDate() + 3);
      const options = { weekday: 'long', month: 'short', day: 'numeric' };
      targetDateEl.textContent = d.toLocaleDateString('en-US', options);
    }
  }

  init();
});
