# Wallpaper API Integration - Wallhaven

This document explains the professional wallpaper system that has been implemented with Wallhaven API integration, replacing the previous dummy data.

## Overview

The wallpaper system has been completely restructured to support multiple wallpaper sources with a focus on professional architecture, extensibility, and maintainability. Currently integrated with Wallhaven.cc API with room for additional sources.

## Architecture

### Core Components

1. **Configuration Layer** (`lib/config/wallhaven.ts`)

   - Centralized configuration for Wallhaven API
   - Environment variable support
   - Rate limiting settings

2. **Type Definitions** (`types/wallhaven.ts`)

   - Complete TypeScript interfaces for Wallhaven API
   - Local wallpaper type for UI compatibility
   - Search parameters and response types

3. **API Service Layer** (`lib/services/wallhaven-api.ts`)

   - Professional API service class
   - Rate limiting and request queuing
   - Error handling and retry logic
   - Data transformation and mapping

4. **Provider Layer** (`lib/providers/wallpaper-provider.ts`)

   - Multi-source wallpaper provider
   - Source management and validation
   - Unified search interface
   - Future-ready for additional sources

5. **React Hooks** (`hooks/use-wallpapers.ts`)

   - Custom hooks for wallpaper data management
   - Caching and background updates
   - Loading states and error handling
   - Pagination support

6. **UI Components**
   - Updated wallpaper page with real API integration
   - Source status monitoring component
   - Enhanced modal with detailed wallpaper information

## Environment Setup

### Required Environment Variables

Create a `.env.local` file in the project root with:

```env
NEXT_PUBLIC_WALLHAVEN_API_KEY=6hD9gTaTNnsq9bWXPbyjugN0QSrT76hi
NEXT_PUBLIC_WALLHAVEN_BASE_URL=https://wallhaven.cc/api/v1
```

### API Key Configuration

The provided API key is already configured and should work out of the box. For production use, consider:

1. Getting your own API key from [Wallhaven](https://wallhaven.cc/settings/account)
2. Setting up proper environment variable management
3. Implementing key rotation if needed

## Features

### Current Features

- **Real-time Wallpaper Search**: Live search through Wallhaven's database
- **Advanced Filtering**: Category, purity, sorting, and resolution filters
- **Pagination**: Load more wallpapers seamlessly
- **Source Status Monitoring**: Real-time connection status to wallpaper sources
- **Caching**: Intelligent caching with configurable expiration
- **Rate Limiting**: Automatic rate limiting to respect API limits
- **Error Handling**: Graceful error handling with fallbacks
- **Toast Notifications**: User feedback for downloads and actions
- **Download & Set Wallpaper**: Full Electron integration for setting wallpapers

### Search Capabilities

- **Text Search**: Search by keywords, tags, or authors
- **Category Filtering**: General, Anime, People
- **Sorting Options**: Latest, Most Popular, Most Viewed, Most Favorited, Random
- **Resolution Filtering**: Support for minimum resolution requirements
- **Purity Levels**: SFW content by default (configurable)

## Usage Examples

### Basic Usage

```typescript
import { useWallpapers } from "@/hooks/use-wallpapers";

function WallpaperComponent() {
  const { wallpapers, isLoading, error, search, loadMore, hasNextPage } =
    useWallpapers({
      category: "General",
      sorting: "date_added",
    });

  // Use wallpapers data...
}
```

### Advanced Search

```typescript
const { search } = useWallpapers();

// Search with specific parameters
await search({
  query: "nature landscape",
  category: "General",
  sorting: "toplist",
  minResolution: "1920x1080",
  purity: "100",
});
```

### Getting Trending Wallpapers

```typescript
import { useTrendingWallpapers } from "@/hooks/use-wallpapers";

function TrendingComponent() {
  const { wallpapers, isLoading } = useTrendingWallpapers();
  // Display trending wallpapers...
}
```

## API Integration Details

### Wallhaven API Endpoints Used

- `GET /search` - Search wallpapers with filters
- `GET /w/{id}` - Get specific wallpaper details
- `GET /tag/{id}` - Get tag information
- `GET /collections` - Get user collections (requires API key)
- `GET /settings` - Get user settings (requires API key)

### Rate Limiting

- **Default Limit**: 45 requests per minute
- **Auto-queuing**: Requests are automatically queued and throttled
- **Backoff Strategy**: Built-in delay between requests

### Data Transformation

The service automatically transforms Wallhaven API responses to match the local wallpaper interface:

```typescript
// Wallhaven API response -> Local wallpaper format
{
  id: string,
  title: string,        // Generated from tags or category
  description: string,  // Generated description
  category: string,     // Mapped to local categories
  resolution: string,
  size: string,         // Formatted file size
  thumbnail: string,    // Large thumb
  preview: string,      // Original thumb
  fullRes: string,      // Full resolution image path
  source: 'wallhaven',
  // ... additional metadata
}
```

## Adding New Sources

The architecture is designed to easily support additional wallpaper sources:

1. **Add Source Configuration**:

   ```typescript
   wallpaperProvider.registerSource({
     id: "new-source",
     name: "New Source",
     description: "Description of new source",
     enabled: true,
     requiresApiKey: false,
   });
   ```

2. **Implement Source Handler**:

   ```typescript
   // In wallpaper-provider.ts
   case 'new-source':
     return this.searchNewSource(options);
   ```

3. **Create API Service**: Follow the pattern established in `wallhaven-api.ts`

## Performance Considerations

### Caching Strategy

- **Memory Caching**: Search results cached for 5 minutes
- **Stale-While-Revalidate**: Show cached data while fetching fresh data
- **Cache Keys**: Generated based on search parameters

### Image Loading

- **Lazy Loading**: Images load as they come into view
- **Progressive Enhancement**: Thumbnails → High-res images
- **Error Fallbacks**: Graceful handling of image load failures

### Network Optimization

- **Request Queuing**: Prevents API rate limit violations
- **Abort on Search**: Cancel previous searches when new search starts
- **Pagination**: Load wallpapers in manageable chunks

## Error Handling

### Types of Errors Handled

1. **Network Errors**: Connection timeouts, offline state
2. **API Errors**: Rate limiting, authentication, server errors
3. **Parsing Errors**: Invalid API responses
4. **User Errors**: Invalid search parameters

### Error Recovery

- **Automatic Retry**: For transient network errors
- **Cached Fallbacks**: Show cached data when API is unavailable
- **User Notifications**: Clear error messages with suggested actions

## Testing

### Development Testing

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

### API Key Validation

The system includes built-in API key validation:

```typescript
const isValid = await wallhavenAPI.validateApiKey();
```

## Monitoring and Debugging

### Source Status Component

A dedicated component shows the status of all wallpaper sources:

- Connection status
- API key validation
- Error states
- Refresh capabilities

### Console Logging

Development builds include detailed logging for:

- API requests and responses
- Cache hits and misses
- Error details
- Performance metrics

## Future Enhancements

### Planned Features

1. **Additional Sources**:

   - Unsplash integration
   - Local file system scanning
   - Custom source plugins

2. **Advanced Features**:

   - Favorites management
   - Download history
   - Automated wallpaper rotation
   - Custom collections

3. **Performance Improvements**:
   - Service worker caching
   - Background sync
   - Image optimization

### Extensibility Points

The system is designed with these extension points:

- Custom source adapters
- Pluggable caching strategies
- Custom UI components
- Theme integration
- Analytics hooks

## Troubleshooting

### Common Issues

1. **API Key Issues**:

   - Verify `.env.local` file exists
   - Check API key validity
   - Ensure proper environment loading

2. **Network Issues**:

   - Check internet connection
   - Verify Wallhaven.cc accessibility
   - Review rate limiting

3. **Build Issues**:
   - Clear node_modules and reinstall
   - Check TypeScript errors
   - Verify environment variables

### Debug Mode

Enable debug logging by setting:

```env
NODE_ENV=development
```

This provides detailed console logging for troubleshooting.

## Security Considerations

### API Key Management

- Store API keys in environment variables
- Never commit API keys to version control
- Consider key rotation for production

### Content Filtering

- SFW content filtering enabled by default
- Configurable purity levels
- User preference management

### Rate Limiting

- Automatic rate limiting prevents API abuse
- Request queuing ensures fair usage
- Error handling for exceeded limits

## Conclusion

This professional wallpaper system provides a solid foundation for wallpaper management with room for future enhancements. The modular architecture ensures maintainability while the robust error handling and caching provide a smooth user experience.

For questions or contributions, refer to the main project documentation or create an issue in the repository.
