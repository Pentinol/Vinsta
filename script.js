class TextureEditor {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.layers = [];
        this.currentLayerId = 0;
        this.layerCounter = 0;
        this.selectedLayerId = null;
        
        // Настройки макета
        this.canvasWidth = 800;
        this.canvasHeight = 600;
        this.canvasOffsetX = 0;
        this.canvasOffsetY = 0;
        this.scale = 1;
        
        // Перетаскивание
        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;
        
        // PBR Generation
        this.pbrType = document.getElementById('pbrType');
        this.intensitySlider = document.getElementById('intensity');
        this.detailSlider = document.getElementById('detail');
        this.intensityValue = document.getElementById('intensityValue');
        this.detailValue = document.getElementById('detailValue');
        this.generatePbrBtn = document.getElementById('generatePbr');
        this.cancelPbrBtn = document.getElementById('cancelPbr');
        
        // Texture Tools
        this.textureToolsToggle = document.getElementById('textureToolsToggle');
        this.textureToolsControls = document.getElementById('textureToolsControls');
        this.brushType = document.getElementById('brushType');
        this.brushSize = document.getElementById('brushSize');
        this.brushSizeValue = document.getElementById('brushSizeValue');
        this.brushOpacity = document.getElementById('brushOpacity');
        this.brushOpacityValue = document.getElementById('brushOpacityValue');
        this.brushColor = document.getElementById('brushColor');
        this.brushColorPreview = document.getElementById('brushColorPreview');
        this.pixelDensity = document.getElementById('pixelDensity');
        this.pixelDensityValue = document.getElementById('pixelDensityValue');
        this.blurIntensity = document.getElementById('blurIntensity');
        this.blurIntensityValue = document.getElementById('blurIntensityValue');
        this.brushHardness = document.getElementById('brushHardness');
        this.brushHardnessValue = document.getElementById('brushHardnessValue');
        this.sprayDensity = document.getElementById('sprayDensity');
        this.sprayDensityValue = document.getElementById('sprayDensityValue');
        this.clearCanvasBtn = document.getElementById('clearCanvas');
        this.brushCursor = document.getElementById('brushCursor');
        
        // Элементы UI
        this.colorModal = document.getElementById('colorModal');
        this.renameModal = document.getElementById('renameModal');
        this.colorPicker = document.getElementById('colorPicker');
        this.colorPreview = document.getElementById('colorPreview');
        this.renameInput = document.getElementById('renameInput');
        this.layerForColor = null;
        this.layerForRename = null;
        
        // Элементы управления разрешением
        this.canvasWidthInput = document.getElementById('canvasWidth');
        this.canvasHeightInput = document.getElementById('canvasHeight');
        this.applyResolutionBtn = document.getElementById('applyResolution');
        this.canvasOverlay = document.getElementById('canvasOverlay');
        
        // Элементы трансформации
        this.selectionOutline = document.getElementById('selectionOutline');
        this.layerTransformPanel = document.getElementById('layerTransformPanel');
        this.layerPosX = document.getElementById('layerPosX');
        this.layerPosY = document.getElementById('layerPosY');
        this.layerWidth = document.getElementById('layerWidth');
        this.layerHeight = document.getElementById('layerHeight');
        this.layerRotation = document.getElementById('layerRotation');
        this.resetTransformBtn = document.getElementById('resetTransform');
        
        // Состояние рисования
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;
        this.isTextureToolsActive = false;
        
        this.init();
    }
    
    init() {
        // Установка размеров canvas
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Обработчики событий
        document.getElementById('addLayerBtn').addEventListener('click', () => this.addLayer());
        document.getElementById('exportBtn').addEventListener('click', () => this.exportImage());
        
        // Обработчики для модальных окон
        document.getElementById('confirmColor').addEventListener('click', () => this.confirmColor());
        document.getElementById('cancelColor').addEventListener('click', () => this.hideColorModal());
        this.colorPicker.addEventListener('input', () => this.updateColorPreview());
        
        document.getElementById('confirmRename').addEventListener('click', () => this.confirmRename());
        document.getElementById('cancelRename').addEventListener('click', () => this.hideRenameModal());
        
        // Обработчики для управления разрешением
        this.applyResolutionBtn.addEventListener('click', () => this.applyResolution());
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const width = parseInt(e.target.dataset.width);
                const height = parseInt(e.target.dataset.height);
                this.canvasWidthInput.value = width;
                this.canvasHeightInput.value = height;
                this.applyResolution();
            });
        });
        
        // Обработчики для трансформации
        this.layerPosX.addEventListener('input', () => this.updateLayerPosition());
        this.layerPosY.addEventListener('input', () => this.updateLayerPosition());
        this.layerWidth.addEventListener('input', () => this.updateLayerSize());
        this.layerHeight.addEventListener('input', () => this.updateLayerSize());
        this.layerRotation.addEventListener('input', () => this.updateLayerRotation());
        this.resetTransformBtn.addEventListener('click', () => this.resetLayerTransform());
        
        // Обработчики для PBR Generation
        this.intensitySlider.addEventListener('input', () => {
            this.intensityValue.textContent = this.intensitySlider.value + '%';
        });
        
        this.detailSlider.addEventListener('input', () => {
            this.detailValue.textContent = this.detailSlider.value;
        });
        
        this.generatePbrBtn.addEventListener('click', () => this.generatePBR());
        this.cancelPbrBtn.addEventListener('click', () => this.cancelPBR());
        
        // Обработчики для Texture Tools
        this.textureToolsToggle.addEventListener('change', () => this.toggleTextureTools());
        this.brushType.addEventListener('change', () => this.updateBrushType());
        this.brushSize.addEventListener('input', () => {
            this.brushSizeValue.textContent = this.brushSize.value;
            this.updateBrushCursor();
        });
        this.brushOpacity.addEventListener('input', () => {
            this.brushOpacityValue.textContent = this.brushOpacity.value + '%';
        });
        this.brushColor.addEventListener('input', () => {
            this.brushColorPreview.style.backgroundColor = this.brushColor.value;
        });
        this.pixelDensity.addEventListener('input', () => {
            this.pixelDensityValue.textContent = this.pixelDensity.value;
        });
        this.blurIntensity.addEventListener('input', () => {
            this.blurIntensityValue.textContent = this.blurIntensity.value;
        });
        this.brushHardness.addEventListener('input', () => {
            this.brushHardnessValue.textContent = this.brushHardness.value;
        });
        this.sprayDensity.addEventListener('input', () => {
            this.sprayDensityValue.textContent = this.sprayDensity.value;
        });
        this.clearCanvasBtn.addEventListener('click', () => this.clearDrawingCanvas());
        
        // Обработчики для рисования
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseleave', () => this.stopDrawing());
        this.canvas.addEventListener('mousemove', (e) => this.updateBrushCursorPosition(e));
        
        // Обработчики для перетаскивания
        this.canvas.addEventListener('mousedown', (e) => this.startDrag(e));
        this.canvas.addEventListener('mousemove', (e) => this.drag(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrag());
        this.canvas.addEventListener('mouseleave', () => this.stopDrag());
        
        // Закрытие модальных окон
        window.addEventListener('click', (e) => {
            if (e.target === this.colorModal) this.hideColorModal();
            if (e.target === this.renameModal) this.hideRenameModal();
        });
        
        // Добавляем два начальных слоя
        this.addLayer();
        this.addLayer();
        
        // Применяем начальное разрешение
        this.applyResolution();
        
        // Инициализация Texture Tools
        this.updateBrushType();
        this.updateBrushCursor();
        
        // Устанавливаем черный цвет и 10% opacity по умолчанию
        this.brushColor.value = '#000000';
        this.brushColorPreview.style.backgroundColor = '#000000';
        this.brushOpacity.value = '10';
        this.brushOpacityValue.textContent = '10%';
    }
    
    resizeCanvas() {
        const container = document.querySelector('.canvas-container');
        this.canvas.width = container.clientWidth - 40;
        this.canvas.height = container.clientHeight - 40;
        this.render();
    }
    
    applyResolution() {
        this.canvasWidth = parseInt(this.canvasWidthInput.value) || 800;
        this.canvasHeight = parseInt(this.canvasHeightInput.value) || 600;
        
        this.canvasOverlay.style.display = 'block';
        
        const container = document.querySelector('.canvas-container');
        const containerWidth = container.clientWidth - 40;
        const containerHeight = container.clientHeight - 40;
        
        this.scale = Math.min(
            containerWidth / this.canvasWidth,
            containerHeight / this.canvasHeight
        );
        
        this.render();
        this.updateSelectionOutline();
    }
    
    toggleTextureTools() {
        this.isTextureToolsActive = this.textureToolsToggle.checked;
        
        if (this.isTextureToolsActive) {
            this.textureToolsControls.style.display = 'flex';
            this.canvas.style.cursor = 'none';
            this.brushCursor.style.display = 'block';
        } else {
            this.textureToolsControls.style.display = 'none';
            this.canvas.style.cursor = 'move';
            this.brushCursor.style.display = 'none';
            this.stopDrawing();
        }
    }
    
    updateBrushType() {
        const brushType = this.brushType.value;
        
        // Скрываем все специфические контролы
        document.querySelectorAll('.brush-specific-controls').forEach(control => {
            control.style.display = 'none';
        });
        
        // Показываем только нужные контролы
        switch (brushType) {
            case 'pixel':
                document.getElementById('pixelControls').style.display = 'flex';
                break;
            case 'blur':
                document.getElementById('blurControls').style.display = 'flex';
                break;
            case 'normal':
                document.getElementById('normalControls').style.display = 'flex';
                break;
            case 'graffiti':
                document.getElementById('graffitiControls').style.display = 'flex';
                break;
        }
        
        this.updateBrushCursor();
    }
    
    updateBrushCursor() {
        const size = parseInt(this.brushSize.value);
        this.brushCursor.style.width = `${size}px`;
        this.brushCursor.style.height = `${size}px`;
        this.brushCursor.style.borderRadius = this.brushType.value === 'pixel' ? '0' : '50%';
    }
    
    updateBrushCursorPosition(e) {
        if (!this.isTextureToolsActive) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.brushCursor.style.left = `${x - parseInt(this.brushSize.value) / 2}px`;
        this.brushCursor.style.top = `${y - parseInt(this.brushSize.value) / 2}px`;
    }
    
    startDrawing(e) {
        if (!this.isTextureToolsActive) return;
        
        this.isDrawing = true;
        const rect = this.canvas.getBoundingClientRect();
        this.lastX = e.clientX - rect.left;
        this.lastY = e.clientY - rect.top;
        
        // Рисуем первую точку
        this.drawPoint(this.lastX, this.lastY);
    }
    
    draw(e) {
        if (!this.isDrawing || !this.isTextureToolsActive) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Рисуем линию между точками
        this.drawLine(this.lastX, this.lastY, x, y);
        
        this.lastX = x;
        this.lastY = y;
    }
    
    stopDrawing() {
        this.isDrawing = false;
    }
    
    drawPoint(x, y) {
        const brushType = this.brushType.value;
        const size = parseInt(this.brushSize.value);
        const opacity = parseInt(this.brushOpacity.value) / 100;
        const color = this.brushColor.value;
        
        // Конвертируем координаты в координаты текстуры
        const textureCoords = this.canvasToTextureCoords(x, y);
        if (!textureCoords) return;
        
        const textureX = textureCoords.x;
        const textureY = textureCoords.y;
        
        switch (brushType) {
            case 'pixel':
                this.drawPixelBrush(textureX, textureY, size, color, opacity);
                break;
            case 'blur':
                this.drawBlurBrush(textureX, textureY, size, color, opacity);
                break;
            case 'normal':
                this.drawNormalBrush(textureX, textureY, size, color, opacity);
                break;
            case 'graffiti':
                this.drawGraffitiBrush(textureX, textureY, size, color, opacity);
                break;
        }
        
        this.render();
    }
    
    drawLine(x1, y1, x2, y2) {
        const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        const steps = Math.max(1, Math.floor(distance / 2));
        
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const x = x1 + (x2 - x1) * t;
            const y = y1 + (y2 - y1) * t;
            this.drawPoint(x, y);
        }
    }
    
    drawPixelBrush(x, y, size, color, opacity) {
        const density = parseInt(this.pixelDensity.value);
        const layer = this.getDrawingLayer();
        
        if (!layer) return;
        
        const ctx = this.createDrawingContext(layer);
        if (!ctx) return;
        
        ctx.fillStyle = color;
        ctx.globalAlpha = opacity;
        
        // Рисуем пиксели с определенной плотностью
        for (let i = 0; i < size; i += density) {
            for (let j = 0; j < size; j += density) {
                if (Math.random() > 0.3) { // Случайность для более естественного вида
                    ctx.fillRect(x + i - size/2, y + j - size/2, 1, 1);
                }
            }
        }
    }
    
    drawBlurBrush(x, y, size, color, opacity) {
        const intensity = parseInt(this.blurIntensity.value);
        const layer = this.getDrawingLayer();
        
        if (!layer) return;
        
        const ctx = this.createDrawingContext(layer);
        if (!ctx) return;
        
        ctx.fillStyle = color;
        ctx.globalAlpha = opacity / (intensity * 0.5);
        
        // Рисуем размытое пятно
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size/2);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, size/2, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawNormalBrush(x, y, size, color, opacity) {
        const hardness = parseInt(this.brushHardness.value);
        const layer = this.getDrawingLayer();
        
        if (!layer) return;
        
        const ctx = this.createDrawingContext(layer);
        if (!ctx) return;
        
        ctx.fillStyle = color;
        ctx.globalAlpha = opacity;
        
        // Рисуем кисть с регулируемой жесткостью
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size/2);
        const hardnessFactor = hardness / 10;
        
        gradient.addColorStop(0, color);
        gradient.addColorStop(hardnessFactor, color);
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, size/2, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawGraffitiBrush(x, y, size, color, opacity) {
        const density = parseInt(this.sprayDensity.value);
        const layer = this.getDrawingLayer();
        
        if (!layer) return;
        
        const ctx = this.createDrawingContext(layer);
        if (!ctx) return;
        
        ctx.fillStyle = color;
        ctx.globalAlpha = opacity;
        
        // Рисуем граффити-эффект с разбрызгиванием
        const sprayCount = Math.max(1, Math.floor(size * density / 10));
        
        for (let i = 0; i < sprayCount; i++) {
            const sprayX = x + (Math.random() - 0.5) * size;
            const sprayY = y + (Math.random() - 0.5) * size;
            const spraySize = Math.random() * size / 3 + 1;
            
            ctx.beginPath();
            ctx.arc(sprayX, sprayY, spraySize, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    getDrawingLayer() {
        // Если выбран слой, используем его, иначе создаем временный слой для рисования
        if (this.selectedLayerId !== null) {
            return this.layers.find(layer => layer.id === this.selectedLayerId);
        } else {
            // Ищем или создаем слой для рисования на всей текстуре
            let drawingLayer = this.layers.find(layer => layer.name === 'Drawing Layer');
            if (!drawingLayer) {
                drawingLayer = this.addLayer();
                drawingLayer.name = 'Drawing Layer';
                this.renderLayersList();
            }
            return drawingLayer;
        }
    }
    
    createDrawingContext(layer) {
        if (!layer.image) {
            // Создаем изображение для слоя, если его нет
            layer.image = document.createElement('canvas');
            layer.image.width = this.canvasWidth;
            layer.image.height = this.canvasHeight;
            layer.originalWidth = this.canvasWidth;
            layer.originalHeight = this.canvasHeight;
            layer.originalImage = layer.image;
        }
        
        if (layer.image instanceof HTMLCanvasElement) {
            return layer.image.getContext('2d');
        }
        
        return null;
    }
    
    canvasToTextureCoords(canvasX, canvasY) {
        const scaledWidth = this.canvasWidth * this.scale;
        const scaledHeight = this.canvasHeight * this.scale;
        const offsetX = (this.canvas.width - scaledWidth) / 2;
        const offsetY = (this.canvas.height - scaledHeight) / 2;
        
        // Проверяем, находится ли точка внутри области текстуры
        if (canvasX < offsetX || canvasX > offsetX + scaledWidth ||
            canvasY < offsetY || canvasY > offsetY + scaledHeight) {
            return null;
        }
        
        // Конвертируем координаты canvas в координаты текстуры
        const textureX = Math.floor((canvasX - offsetX) / this.scale);
        const textureY = Math.floor((canvasY - offsetY) / this.scale);
        
        return { x: textureX, y: textureY };
    }
    
    clearDrawingCanvas() {
        const layer = this.getDrawingLayer();
        if (layer && layer.image) {
            const ctx = this.createDrawingContext(layer);
            if (ctx) {
                ctx.clearRect(0, 0, layer.image.width, layer.image.height);
                this.render();
            }
        }
    }
    
    addLayer() {
        const opacity = this.layerCounter % 2 === 0 ? 1.0 : 0.5;
        
        const layer = {
            id: this.currentLayerId++,
            name: `Layer ${this.layers.length + 1}`,
            image: null,
            color: null,
            opacity: opacity,
            visible: true,
            offsetX: 0,
            offsetY: 0,
            width: 0,
            height: 0,
            rotation: 0,
            originalWidth: 0,
            originalHeight: 0,
            originalImage: null,
            pbrGenerated: false
        };
        
        this.layers.push(layer);
        this.layerCounter++;
        this.renderLayersList();
        this.render();
        
        return layer;
    }
    
    selectLayer(id) {
        this.selectedLayerId = id;
        this.renderLayersList();
        this.updateSelectionOutline();
        this.updateTransformPanel();
    }
    
    duplicateLayer(id) {
        const originalLayer = this.layers.find(layer => layer.id === id);
        if (!originalLayer) return;
        
        const opacity = this.layerCounter % 2 === 0 ? 1.0 : 0.5;
        
        const duplicatedLayer = {
            id: this.currentLayerId++,
            name: `${originalLayer.name} (копия)`,
            image: originalLayer.image,
            color: originalLayer.color,
            opacity: opacity,
            visible: originalLayer.visible,
            offsetX: originalLayer.offsetX + 20,
            offsetY: originalLayer.offsetY + 20,
            width: originalLayer.width,
            height: originalLayer.height,
            rotation: originalLayer.rotation,
            originalWidth: originalLayer.originalWidth,
            originalHeight: originalLayer.originalHeight,
            originalImage: originalLayer.originalImage,
            pbrGenerated: originalLayer.pbrGenerated
        };
        
        this.layers.push(duplicatedLayer);
        this.layerCounter++;
        this.selectLayer(duplicatedLayer.id);
        this.renderLayersList();
        this.render();
    }
    
    removeLayer(id) {
        this.layers = this.layers.filter(layer => layer.id !== id);
        if (this.selectedLayerId === id) {
            this.selectedLayerId = null;
            this.hideTransformPanel();
        }
        this.renderLayersList();
        this.render();
    }
    
    clearLayerTexture(id) {
        const layer = this.layers.find(layer => layer.id === id);
        if (layer) {
            layer.image = null;
            layer.color = null;
            layer.offsetX = 0;
            layer.offsetY = 0;
            layer.width = 0;
            layer.height = 0;
            layer.rotation = 0;
            layer.originalWidth = 0;
            layer.originalHeight = 0;
            layer.originalImage = null;
            layer.pbrGenerated = false;
            this.renderLayersList();
            this.render();
            this.updateTransformPanel();
        }
    }
    
    moveLayerUp(id) {
        const index = this.layers.findIndex(layer => layer.id === id);
        if (index < this.layers.length - 1) {
            [this.layers[index], this.layers[index + 1]] = [this.layers[index + 1], this.layers[index]];
            this.renderLayersList();
            this.render();
        }
    }
    
    moveLayerDown(id) {
        const index = this.layers.findIndex(layer => layer.id === id);
        if (index > 0) {
            [this.layers[index], this.layers[index - 1]] = [this.layers[index - 1], this.layers[index]];
            this.renderLayersList();
            this.render();
        }
    }
    
    toggleLayerVisibility(id) {
        const layer = this.layers.find(layer => layer.id === id);
        if (layer) {
            layer.visible = !layer.visible;
            this.renderLayersList();
            this.render();
        }
    }
    
    updateLayerOpacity(id, opacity) {
        const layer = this.layers.find(layer => layer.id === id);
        if (layer) {
            layer.opacity = opacity;
            this.render();
        }
    }
    
    handleFileUpload(layerId, event) {
        const files = event.target.files;
        if (files.length === 0) return;
        
        const layer = this.layers.find(layer => layer.id === layerId);
        if (!layer) return;
        
        const file = files[0];
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                layer.image = img;
                layer.color = null;
                layer.name = file.name;
                layer.offsetX = 0;
                layer.offsetY = 0;
                layer.width = img.width;
                layer.height = img.height;
                layer.rotation = 0;
                layer.originalWidth = img.width;
                layer.originalHeight = img.height;
                layer.originalImage = img;
                layer.pbrGenerated = false;
                this.renderLayersList();
                this.render();
                this.updateTransformPanel();
            };
            img.src = e.target.result;
        };
        
        reader.readAsDataURL(file);
        event.target.value = '';
    }
    
    generatePBR() {
        const layer = this.layers.find(l => l.id === this.selectedLayerId);
        if (!layer || !layer.image) {
            alert('Please select an image layer to generate a PBR map.');
            return;
        }
        
        const type = this.pbrType.value;
        const intensity = parseInt(this.intensitySlider.value) / 100;
        const detail = parseInt(this.detailSlider.value);
        
        // Сохраняем оригинальное изображение если это первая генерация
        if (!layer.pbrGenerated) {
            layer.originalImage = layer.image;
        }
        
        // Создаем временный canvas для обработки
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = layer.image.width;
        tempCanvas.height = layer.image.height;
        
        // Рисуем оригинальное изображение
        tempCtx.drawImage(layer.originalImage, 0, 0);
        
        // Получаем данные изображения
        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const data = imageData.data;
        
        // Применяем эффекты в зависимости от типа PBR карты
        switch (type) {
            case 'normal':
                this.generateNormalMap(data, tempCanvas.width, tempCanvas.height, intensity, detail);
                break;
            case 'roughness':
                this.generateRoughnessMap(data, intensity, detail);
                break;
            case 'metallic':
                this.generateMetallicMap(data, intensity, detail);
                break;
        }
        
        // Обновляем изображение
        tempCtx.putImageData(imageData, 0, 0);
        
        // Создаем новое изображение из обработанного canvas
        const processedImage = new Image();
        processedImage.onload = () => {
            layer.image = processedImage;
            layer.pbrGenerated = true;
            this.render();
        };
        processedImage.src = tempCanvas.toDataURL();
    }
    
    generateNormalMap(data, width, height, intensity, detail) {
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const i = (y * width + x) * 4;
                
                // Получаем высоту из яркости пикселя
                const heightValue = (data[i] + data[i + 1] + data[i + 2]) / 3 / 255;
                
                // Вычисляем нормали (упрощенный алгоритм)
                const xNormal = Math.sin(heightValue * Math.PI * 2 * detail) * intensity * 127 + 128;
                const yNormal = Math.cos(heightValue * Math.PI * 2 * detail) * intensity * 127 + 128;
                const zNormal = 255;
                
                data[i] = xNormal;     // R
                data[i + 1] = yNormal; // G
                data[i + 2] = zNormal; // B
                data[i + 3] = 255;     // A
            }
        }
    }
    
    generateRoughnessMap(data, intensity, detail) {
        for (let i = 0; i < data.length; i += 4) {
            const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
            // Инвертируем яркость для roughness (темные участки = более шероховатые)
            const roughness = (255 - brightness) * intensity;
            
            data[i] = roughness;     // R
            data[i + 1] = roughness; // G
            data[i + 2] = roughness; // B
        }
    }
    
    generateMetallicMap(data, intensity, detail) {
        for (let i = 0; i < data.length; i += 4) {
            const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
            // Яркие участки = более металлические
            const metallic = brightness * intensity;
            
            data[i] = metallic;     // R
            data[i + 1] = metallic; // G
            data[i + 2] = metallic; // B
        }
    }
    
    cancelPBR() {
        const layer = this.layers.find(l => l.id === this.selectedLayerId);
        if (layer && layer.pbrGenerated && layer.originalImage) {
            layer.image = layer.originalImage;
            layer.pbrGenerated = false;
            this.render();
        }
    }
    
    showColorModal(layerId) {
        this.layerForColor = this.layers.find(layer => layer.id === layerId);
        if (this.layerForColor) {
            this.colorPicker.value = this.layerForColor.color || '#808080';
            this.updateColorPreview();
            this.colorModal.style.display = 'flex';
        }
    }
    
    updateColorPreview() {
        this.colorPreview.style.backgroundColor = this.colorPicker.value;
    }
    
    hideColorModal() {
        this.colorModal.style.display = 'none';
        this.layerForColor = null;
    }
    
    confirmColor() {
        if (this.layerForColor) {
            this.layerForColor.color = this.colorPicker.value;
            this.layerForColor.image = null;
            this.layerForColor.offsetX = 0;
            this.layerForColor.offsetY = 0;
            this.layerForColor.width = 0;
            this.layerForColor.height = 0;
            this.layerForColor.rotation = 0;
            this.layerForColor.pbrGenerated = false;
            this.renderLayersList();
            this.render();
            this.updateTransformPanel();
        }
        this.hideColorModal();
    }
    
    showRenameModal(layerId) {
        this.layerForRename = this.layers.find(layer => layer.id === layerId);
        if (this.layerForRename) {
            this.renameInput.value = this.layerForRename.name;
            this.renameModal.style.display = 'flex';
            this.renameInput.focus();
        }
    }
    
    hideRenameModal() {
        this.renameModal.style.display = 'none';
        this.layerForRename = null;
    }
    
    confirmRename() {
        if (this.layerForRename && this.renameInput.value.trim() !== '') {
            this.layerForRename.name = this.renameInput.value.trim();
            this.renderLayersList();
        }
        this.hideRenameModal();
    }
    
    updateTransformPanel() {
        const layer = this.layers.find(l => l.id === this.selectedLayerId);
        if (layer && (layer.image || layer.color)) {
            this.layerTransformPanel.style.display = 'flex';
            this.layerPosX.value = Math.round(layer.offsetX);
            this.layerPosY.value = Math.round(layer.offsetY);
            this.layerWidth.value = Math.round(layer.width || layer.originalWidth);
            this.layerHeight.value = Math.round(layer.height || layer.originalHeight);
            this.layerRotation.value = Math.round(layer.rotation);
        } else {
            this.hideTransformPanel();
        }
    }
    
    hideTransformPanel() {
        this.layerTransformPanel.style.display = 'none';
    }
    
    updateLayerPosition() {
        const layer = this.layers.find(l => l.id === this.selectedLayerId);
        if (layer) {
            layer.offsetX = parseInt(this.layerPosX.value) || 0;
            layer.offsetY = parseInt(this.layerPosY.value) || 0;
            this.render();
            this.updateSelectionOutline();
        }
    }
    
    updateLayerSize() {
        const layer = this.layers.find(l => l.id === this.selectedLayerId);
        if (layer) {
            layer.width = parseInt(this.layerWidth.value) || layer.originalWidth;
            layer.height = parseInt(this.layerHeight.value) || layer.originalHeight;
            this.render();
            this.updateSelectionOutline();
        }
    }
    
    updateLayerRotation() {
        const layer = this.layers.find(l => l.id === this.selectedLayerId);
        if (layer) {
            layer.rotation = parseInt(this.layerRotation.value) || 0;
            this.render();
            this.updateSelectionOutline();
        }
    }
    
    resetLayerTransform() {
        const layer = this.layers.find(l => l.id === this.selectedLayerId);
        if (layer) {
            layer.offsetX = 0;
            layer.offsetY = 0;
            layer.width = layer.originalWidth;
            layer.height = layer.originalHeight;
            layer.rotation = 0;
            this.render();
            this.updateTransformPanel();
            this.updateSelectionOutline();
        }
    }
    
    updateSelectionOutline() {
        const layer = this.layers.find(l => l.id === this.selectedLayerId);
        if (layer && (layer.image || layer.color)) {
            const scaledWidth = this.canvasWidth * this.scale;
            const scaledHeight = this.canvasHeight * this.scale;
            const offsetX = (this.canvas.width - scaledWidth) / 2;
            const offsetY = (this.canvas.height - scaledHeight) / 2;
            
            const displayWidth = (layer.width || layer.originalWidth) * this.scale;
            const displayHeight = (layer.height || layer.originalHeight) * this.scale;
            const displayX = offsetX + layer.offsetX * this.scale;
            const displayY = offsetY + layer.offsetY * this.scale;
            
            this.selectionOutline.style.display = 'block';
            this.selectionOutline.style.left = `${displayX}px`;
            this.selectionOutline.style.top = `${displayY}px`;
            this.selectionOutline.style.width = `${displayWidth}px`;
            this.selectionOutline.style.height = `${displayHeight}px`;
            this.selectionOutline.style.transform = `rotate(${layer.rotation}deg)`;
            this.selectionOutline.style.transformOrigin = 'center';
        } else {
            this.selectionOutline.style.display = 'none';
        }
    }
    
    startDrag(e) {
        if (this.isTextureToolsActive) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const layer = this.layers.find(l => l.id === this.selectedLayerId);
        if (layer && (layer.image || layer.color)) {
            this.isDragging = true;
            this.dragStartX = x;
            this.dragStartY = y;
            this.dragOffsetX = layer.offsetX;
            this.dragOffsetY = layer.offsetY;
            this.canvas.style.cursor = 'grabbing';
        }
    }
    
    drag(e) {
        if (!this.isDragging || this.isTextureToolsActive) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const layer = this.layers.find(l => l.id === this.selectedLayerId);
        if (!layer) return;
        
        const dx = (x - this.dragStartX) / this.scale;
        const dy = (y - this.dragStartY) / this.scale;
        
        layer.offsetX = this.dragOffsetX + dx;
        layer.offsetY = this.dragOffsetY + dy;
        
        this.render();
        this.updateTransformPanel();
        this.updateSelectionOutline();
    }
    
    stopDrag() {
        this.isDragging = false;
        if (!this.isTextureToolsActive) {
            this.canvas.style.cursor = 'move';
        }
    }
    
    renderLayersList() {
        const layersList = document.getElementById('layersList');
        layersList.innerHTML = '';
        
        [...this.layers].reverse().forEach(layer => {
            const layerElement = document.createElement('div');
            const isSelected = layer.id === this.selectedLayerId;
            layerElement.className = `layer-item ${layer.visible ? 'layer-visible' : 'layer-hidden'} ${isSelected ? 'selected' : ''}`;
            layerElement.dataset.layerId = layer.id;
            
            let contentInfo = 'Empty';
            if (layer.image) {
                contentInfo = layer.pbrGenerated ? 'PBR map' : 'Image';
            } else if (layer.color) {
                contentInfo = 'Color';
            }
            
            layerElement.innerHTML = `
                <div class="layer-header">
                    <div class="layer-name" title="${layer.name}">${layer.name}</div>
                    <div class="layer-controls">
                        <button class="add-image" title="Add Image">+</button>
                        <button class="set-color" title="Set Color" style="background-color: ${layer.color || '#333'}">■</button>
                        <button class="duplicate" title="Dublicate">⎘</button>
                        <button class="rename" title="Rename">✎</button>
                    </div>
                </div>
                <div class="opacity-control">
                    <span>Transparency:</span>
                    <input type="range" min="0" max="1" step="0.01" value="${layer.opacity}" class="opacity-slider">
                </div>
                <div style="font-size: 10px; color: #aaa;">${contentInfo}</div>
                <div class="layer-bottom-controls">
                    <button class="move-up" title="Raise">↑</button>
                    <button class="move-down" title="Lower">↓</button>
                    <button class="toggle-visibility" title="${layer.visible ? 'Hide' : 'Show'}">👁</button>
                    <button class="clear-texture" title="Clear Trash">×</button>
                    <button class="remove" title="Delete Layer">🗑</button>
                </div>
            `;
            
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.png,.jpg,.jpeg,.webp';
            fileInput.style.display = 'none';
            layerElement.appendChild(fileInput);
            
            // Обработчики событий
            layerElement.addEventListener('click', (e) => {
                if (!e.target.closest('button')) {
                    this.selectLayer(layer.id);
                }
            });
            
            layerElement.querySelector('.add-image').addEventListener('click', () => {
                fileInput.click();
            });
            
            fileInput.addEventListener('change', (e) => {
                this.handleFileUpload(layer.id, e);
                this.selectLayer(layer.id);
            });
            
            layerElement.querySelector('.set-color').addEventListener('click', () => {
                this.showColorModal(layer.id);
                this.selectLayer(layer.id);
            });
            
            layerElement.querySelector('.duplicate').addEventListener('click', () => {
                this.duplicateLayer(layer.id);
            });
            
            layerElement.querySelector('.rename').addEventListener('click', () => {
                this.showRenameModal(layer.id);
            });
            
            layerElement.querySelector('.move-up').addEventListener('click', () => {
                this.moveLayerUp(layer.id);
            });
            
            layerElement.querySelector('.move-down').addEventListener('click', () => {
                this.moveLayerDown(layer.id);
            });
            
            layerElement.querySelector('.toggle-visibility').addEventListener('click', () => {
                this.toggleLayerVisibility(layer.id);
            });
            
            layerElement.querySelector('.clear-texture').addEventListener('click', () => {
                this.clearLayerTexture(layer.id);
            });
            
            layerElement.querySelector('.remove').addEventListener('click', () => {
                if (this.layers.length > 1) {
                    this.removeLayer(layer.id);
                } else {
                    alert('Minimum number of layers - 1');
                }
            });
            
            layerElement.querySelector('.opacity-slider').addEventListener('input', (e) => {
                this.updateLayerOpacity(layer.id, parseFloat(e.target.value));
            });
            
            layersList.appendChild(layerElement);
        });
    }
    
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#3d3d3d';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        const scaledWidth = this.canvasWidth * this.scale;
        const scaledHeight = this.canvasHeight * this.scale;
        const offsetX = (this.canvas.width - scaledWidth) / 2;
        const offsetY = (this.canvas.height - scaledHeight) / 2;
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(offsetX, offsetY, scaledWidth, scaledHeight);
        
        this.ctx.save();
        this.ctx.translate(offsetX, offsetY);
        this.ctx.scale(this.scale, this.scale);
        
        this.layers.forEach(layer => {
            if (layer.visible) {
                this.ctx.globalAlpha = layer.opacity;
                
                if (layer.image) {
                    const width = layer.width || layer.image.width;
                    const height = layer.height || layer.image.height;
                    
                    this.ctx.save();
                    this.ctx.translate(layer.offsetX + width/2, layer.offsetY + height/2);
                    this.ctx.rotate(layer.rotation * Math.PI / 180);
                    this.ctx.drawImage(
                        layer.image, 
                        -width/2, 
                        -height/2,
                        width,
                        height
                    );
                    this.ctx.restore();
                } else if (layer.color) {
                    const width = layer.width || this.canvasWidth;
                    const height = layer.height || this.canvasHeight;
                    
                    this.ctx.save();
                    this.ctx.translate(layer.offsetX + width/2, layer.offsetY + height/2);
                    this.ctx.rotate(layer.rotation * Math.PI / 180);
                    this.ctx.fillStyle = layer.color;
                    this.ctx.fillRect(
                        -width/2, 
                        -height/2,
                        width,
                        height
                    );
                    this.ctx.restore();
                }
            }
        });
        
        this.ctx.restore();
        this.ctx.globalAlpha = 1;
    }
    
    exportImage() {
        const exportCanvas = document.createElement('canvas');
        const exportCtx = exportCanvas.getContext('2d');
        
        exportCanvas.width = this.canvasWidth;
        exportCanvas.height = this.canvasHeight;
        
        this.layers.forEach(layer => {
            if (layer.visible) {
                exportCtx.globalAlpha = layer.opacity;
                
                if (layer.image) {
                    const width = layer.width || layer.image.width;
                    const height = layer.height || layer.image.height;
                    
                    exportCtx.save();
                    exportCtx.translate(layer.offsetX + width/2, layer.offsetY + height/2);
                    exportCtx.rotate(layer.rotation * Math.PI / 180);
                    exportCtx.drawImage(
                        layer.image, 
                        -width/2, 
                        -height/2,
                        width,
                        height
                    );
                    exportCtx.restore();
                } else if (layer.color) {
                    const width = layer.width || this.canvasWidth;
                    const height = layer.height || this.canvasHeight;
                    
                    exportCtx.save();
                    exportCtx.translate(layer.offsetX + width/2, layer.offsetY + height/2);
                    exportCtx.rotate(layer.rotation * Math.PI / 180);
                    exportCtx.fillStyle = layer.color;
                    exportCtx.fillRect(
                        -width/2, 
                        -height/2,
                        width,
                        height
                    );
                    exportCtx.restore();
                }
            }
        });
        
        exportCtx.globalAlpha = 1;
        
        const format = document.getElementById('exportFormat').value;
        let mimeType, extension;
        
        switch (format) {
            case 'png':
                mimeType = 'image/png';
                extension = 'png';
                break;
            case 'jpg':
            case 'jpeg':
                mimeType = 'image/jpeg';
                extension = 'jpg';
                break;
            case 'webp':
                mimeType = 'image/webp';
                extension = 'webp';
                break;
            default:
                mimeType = 'image/png';
                extension = 'png';
        }
        
        const link = document.createElement('a');
        link.download = `texture-${new Date().getTime()}.${extension}`;
        link.href = exportCanvas.toDataURL(mimeType);
        link.click();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TextureEditor();
});