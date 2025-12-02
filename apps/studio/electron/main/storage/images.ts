import { app } from 'electron';
import { existsSync, mkdirSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from 'fs';
import { join } from 'path';

class ImageStorage {
    private static instance: ImageStorage;
    private constructor() {}

    public static getInstance(): ImageStorage {
        if (!ImageStorage.instance) {
            ImageStorage.instance = new ImageStorage();
        }
        return ImageStorage.instance;
    }

    private get IMAGES_FOLDER(): string {
        return join(app.getPath('userData'), 'images');
    }

    private ensureImagesFolderExists() {
        if (!existsSync(this.IMAGES_FOLDER)) {
            mkdirSync(this.IMAGES_FOLDER, { recursive: true });
        }
    }

    readImage(fileName: string): string | null {
        const filePath = join(this.IMAGES_FOLDER, fileName);
        try {
            if (existsSync(filePath)) {
                const base64Img = readFileSync(filePath, { encoding: 'base64' });
                const processedBase64Img = `data:image/png;base64,${base64Img}`;
                return processedBase64Img;
            }
            console.error(`Image not found: ${filePath}`);
            return null;
        } catch (error) {
            console.error(`Error reading image ${fileName}:`, error);
            return null;
        }
    }

    writeImage(fileName: string, base64Img: string): string | null {
        this.ensureImagesFolderExists();
        const data = base64Img.replace(/^data:image\/\w+;base64,/, '');
        const imageData = Buffer.from(data, 'base64');
        const filePath = join(this.IMAGES_FOLDER, fileName);
        try {
            writeFileSync(filePath, new Uint8Array(imageData));
            return filePath;
        } catch (error) {
            console.error(`Error saving image ${fileName}:`, error);
            return null;
        }
    }

    deleteImage(fileName: string): boolean {
        const filePath = join(this.IMAGES_FOLDER, fileName);
        try {
            if (existsSync(filePath)) {
                unlinkSync(filePath);
                return true;
            }
            console.log(`Image not found: ${filePath}`);
            return false;
        } catch (error) {
            console.error(`Error deleting image ${fileName}:`, error);
            return false;
        }
    }

    listImages(): string[] {
        try {
            this.ensureImagesFolderExists();
            return readdirSync(this.IMAGES_FOLDER);
        } catch (error) {
            console.error('Error listing images:', error);
            return [];
        }
    }
}

export const imageStorage = ImageStorage.getInstance();
