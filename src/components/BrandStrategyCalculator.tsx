"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { AlertCircle, CheckCircle2, XCircle, HelpCircle, ChevronDown, ChevronUp, Save, Trash2 } from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';

// Interface for history entries
interface HistoryEntry {
  id: string;
  brandName: string;
  date: string;
  metrics: Record<string, string>;
  scores: Record<string, number>;
}

interface DeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  brandName: string;
  confirmationText: string;
  setConfirmationText: (text: string) => void;
}

const DeleteDialog: React.FC<DeleteDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    brandName,
    confirmationText,
    setConfirmationText,
  }) => (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Entry</DialogTitle>
          <DialogDescription>
            This action cannot be undone. To confirm deletion, please type "{brandName}" below.
          </DialogDescription>
        </DialogHeader>
        <Input
          value={confirmationText}
          onChange={(e) => setConfirmationText(e.target.value)}
          placeholder="Type brand name to confirm"
        />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={confirmationText !== brandName}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
);


// Move MetricInput to the top level
const MetricInput: React.FC<{
  category: string;
  metric: string;
  details: { label: string; weight: number; placeholder: string };
  enabledMetrics: Record<string, boolean>;
  handleMetricToggle: (metric: string) => void;
  metrics: Record<string, string>;
  handleInputChange: (metric: string, value: string) => void;
}> = ({ category, metric, details, enabledMetrics, handleMetricToggle, metrics, handleInputChange }) => (
  <TooltipProvider>
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Checkbox
          checked={enabledMetrics[metric]}
          onCheckedChange={() => handleMetricToggle(metric)}
        />
        <Label className="flex items-center gap-2">
          {details.label}
          <Tooltip>
            <TooltipTrigger>
              <HelpCircle className="h-4 w-4 text-gray-400" />
            </TooltipTrigger>
            <TooltipContent className="w-64">
              <div className="space-y-2">
                <p>{details.placeholder}</p>
                <p className="text-sm text-gray-500">
                  Base Weight: {(details.weight * 100).toFixed(1)}%
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        </Label>
      </div>
      <Input
        type="text"
        inputMode="decimal"
        value={metrics[metric]}
        onChange={(e) => handleInputChange(metric, e.target.value)}
        placeholder={details.placeholder}
        className="w-full"
        disabled={!enabledMetrics[metric]}
      />
    </div>
  </TooltipProvider>
);

const BrandStrategyCalculator = () => {
  // Define all available metrics with their categories and default weights
  const allMetrics = {
    awareness: {
      reachImpressions: { label: 'Reach (millions)', weight: 0.04, placeholder: 'Total impressions across channels' },
      brandRecall: { label: 'Brand Recall (%)', weight: 0.04, placeholder: 'Percentage who remember your brand' },
      engagementRate: { label: 'Engagement Rate (%)', weight: 0.04, placeholder: 'Average engagement across channels' },
      directTraffic: { label: 'Direct Traffic (thousands)', weight: 0.04, placeholder: 'Monthly direct website visitors' },
      brandSearchVolume: { label: 'Brand Search Volume (thousands)', weight: 0.04, placeholder: 'Monthly brand searches' }
    },
    perception: {
      brandImageScore: { label: 'Brand Image Score', weight: 0.05, placeholder: 'Overall brand perception (0-100)' },
      sentimentScore: { label: 'Sentiment Score', weight: 0.05, placeholder: 'Positive sentiment percentage' },
      socialMediaGrowth: { label: 'Social Media Growth (%)', weight: 0.05, placeholder: 'Follower growth rate' },
      purchaseIntent: { label: 'Purchase Intent Score', weight: 0.05, placeholder: 'Purchase likelihood (0-100)' },
      socialProof: { label: 'Social Proof Score', weight: 0.05, placeholder: 'Average review rating (0-100)' }
    },
    loyalty: {
      npsScore: { label: 'NPS', weight: 0.05, placeholder: 'Net Promoter Score (-100 to 100)' },
      repeatPurchaseRate: { label: 'Repeat Purchase Rate (%)', weight: 0.05, placeholder: 'Percentage of repeat customers' },
      clv: { label: 'CLV (thousands)', weight: 0.05, placeholder: 'Customer Lifetime Value' },
      aov: { label: 'AOV', weight: 0.05, placeholder: 'Average Order Value' },
      timeBetweenPurchases: { label: 'Purchase Frequency (days)', weight: 0.05, placeholder: 'Average days between purchases' }
    },
    performance: {
      marketShare: { label: 'Market Share (%)', weight: 0.04, placeholder: 'Percentage of market share' },
      revenueGrowth: { label: 'Revenue Growth (%)', weight: 0.04, placeholder: 'Year-over-year growth rate' },
      profitMargins: { label: 'Profit Margins (%)', weight: 0.04, placeholder: 'Net profit margin' },
      cac: { label: 'CAC', weight: 0.04, placeholder: 'Customer Acquisition Cost' },
      marketingROI: { label: 'Marketing ROI (%)', weight: 0.04, placeholder: 'Return on Marketing Investment' }
    },
    distribution: {
      distributionCoverage: { label: 'Distribution Coverage (%)', weight: 0.04, placeholder: 'Market coverage percentage' },
      salesVelocity: { label: 'Sales Velocity', weight: 0.04, placeholder: 'Units sold per period' },
      roas: { label: 'ROAS', weight: 0.04, placeholder: 'Return on Ad Spend' }
    },
    equity: {
      brandValue: { label: 'Brand Value', weight: 0.03, placeholder: 'Normalized brand value (0-100)' },
      brandStrength: { label: 'Brand Strength', weight: 0.03, placeholder: 'Overall brand strength (0-100)' },
      brandResonance: { label: 'Brand Resonance', weight: 0.03, placeholder: 'Customer connection score (0-100)' },
      mediaCoverage: { label: 'Media Coverage Quality', weight: 0.03, placeholder: 'Media sentiment score (0-100)' },
      influencerAffinity: { label: 'Influencer Brand Affinity', weight: 0.03, placeholder: 'Influencer alignment score (0-100)' }
    }
  };

  const [brandName, setBrandName] = useState<string>('');
    const [metrics, setMetrics] = useState<Record<string, string>>(() => {
        const initialMetrics: Record<string, string> = {};
        Object.entries(allMetrics).forEach(([category, categoryMetrics]) => {
            Object.keys(categoryMetrics).forEach(metric => {
              initialMetrics[metric] = '';
            });
          });
        return initialMetrics;
    });
  const [enabledMetrics, setEnabledMetrics] = useState<Record<string, boolean>>({});
  const [scores, setScores] = useState<Record<string, number>>({});
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [expandedHistory, setExpandedHistory] = useState<string | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [entryToDelete, setEntryToDelete] = useState<HistoryEntry | null>(null);
    const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  // Initialize enabled status
  useEffect(() => {
    const initialEnabled: Record<string, boolean> = {};

    Object.entries(allMetrics).forEach(([category, categoryMetrics]) => {
      Object.keys(categoryMetrics).forEach(metric => {
        initialEnabled[metric] = true;
      });
    });

    setEnabledMetrics(initialEnabled);

    const savedHistory = localStorage.getItem('brandStrategyHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);


  // Save current state to history
  const saveToHistory = () => {
    if (!brandName.trim()) {
      alert('Please enter a brand name before saving');
      return;
    }

    const newEntry: HistoryEntry = {
      id: Date.now().toString(),
      brandName: brandName.trim(),
      date: new Date().toISOString(),
      metrics: { ...metrics },
      scores: { ...scores }
    };

    const updatedHistory = [newEntry, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('brandStrategyHistory', JSON.stringify(updatedHistory));
  };

  // Load a specific history entry
  const loadHistoryEntry = (entry: HistoryEntry) => {
    setBrandName(entry.brandName);
    setMetrics(entry.metrics);
    setScores(entry.scores);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

    // Normalization and score calculation logic
    const normalizeMetricScore = (metric: string, value: string): number => {
        if (!value || !enabledMetrics[metric]) return 0;
        const numValue = Number(value);
    
        switch (metric) {
          case 'reachImpressions':
          case 'directTraffic':
          case 'brandSearchVolume':
            return Math.min(numValue * 10, 100);
          case 'npsScore':
            return ((numValue + 100) / 2);
          case 'clv':
          case 'aov':
            return Math.min(numValue / 10, 100);
          case 'timeBetweenPurchases':
            return Math.max(0, 100 - (numValue / 3));
          case 'cac':
            return Math.max(0, 100 - (numValue / 5));
          case 'revenueGrowth':
          case 'marketingROI':
          case 'roas':
            return Math.min(numValue * 5, 100);
          default:
            return Math.min(Math.max(numValue, 0), 100);
        }
      };

  const calculateAdjustedWeights = () => {
    const enabledWeights: Record<string, number> = {};
    let totalWeight = 0;

    Object.entries(allMetrics).forEach(([category, categoryMetrics]) => {
      Object.entries(categoryMetrics).forEach(([metric, details]) => {
        if (enabledMetrics[metric]) {
          totalWeight += details.weight;
          enabledWeights[metric] = details.weight;
        }
      });
    });

    Object.keys(enabledWeights).forEach(metric => {
      enabledWeights[metric] = enabledWeights[metric] / totalWeight;
    });

    return enabledWeights;
  };

  const calculateScores = () => {
    const adjustedWeights = calculateAdjustedWeights();
    const categoryScores: Record<string, number> = {};
    let overallScore = 0;

    Object.entries(allMetrics).forEach(([category, categoryMetrics]) => {
      let categoryScore = 0;
      let categoryWeight = 0;

      Object.entries(categoryMetrics).forEach(([metric, details]) => {
        if (enabledMetrics[metric]) {
          const normalizedScore = normalizeMetricScore(metric, metrics[metric]);
          categoryScore += normalizedScore * adjustedWeights[metric];
          categoryWeight += adjustedWeights[metric];
        }
      });

      categoryScores[category] = categoryWeight > 0 ? categoryScore / categoryWeight : 0;
      overallScore += categoryScores[category] * categoryWeight;
    });

    categoryScores.overall = overallScore;
    setScores(categoryScores);
  };

  useEffect(() => {
    calculateScores();
  }, [metrics, enabledMetrics]);

  const handleInputChange = (metric: string, value: string) => {
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        setMetrics(prev => ({
          ...prev,
          [metric]: value
        }));
      }
  };

  const handleMetricToggle = (metric: string) => {
    setEnabledMetrics(prev => ({
      ...prev,
      [metric]: !prev[metric]
    }));
  };

    const getScoreCategory = (score: number): { category: string; color: string } => {
        if (score >= 90) return { category: "Exceptional", color: "text-green-600" };
        if (score >= 80) return { category: "Very Effective", color: "text-green-500" };
        if (score >= 70) return { category: "Effective", color: "text-green-400" };
        if (score >= 60) return { category: "Moderately Effective", color: "text-yellow-500" };
        if (score >= 50) return { category: "Needs Improvement", color: "text-orange-500" };
        return { category: "Ineffective", color: "text-red-500" };
      };

    // Add delete functionality
    const handleDeleteEntry = (entry: HistoryEntry) => {
        setEntryToDelete(entry);
        setDeleteDialogOpen(true);
        setDeleteConfirmationText('');
    };

    const confirmDelete = () => {
        if (entryToDelete && deleteConfirmationText === entryToDelete.brandName) {
            const updatedHistory = history.filter(entry => entry.id !== entryToDelete.id);
            setHistory(updatedHistory);
            localStorage.setItem('brandStrategyHistory', JSON.stringify(updatedHistory));
            setDeleteDialogOpen(false);
            setEntryToDelete(null);
            setDeleteConfirmationText('');
        }
    };

  return (
    <>
        {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-primary">BrandPulse Analytics</h1>
          <p className="text-sm text-gray-500">Brand Strategy Performance Calculator</p>
        </div>
      </div>

        <div className="w-full max-w-6xl mx-auto space-y-8 p-4">
      
      <Card>
        <CardHeader>
          <CardTitle>Brand Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-grow">
              <Label htmlFor="brandName">Brand Name</Label>
              <Input
                id="brandName"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Enter brand name"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={saveToHistory}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save Results
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Brand Strategy Calculator</CardTitle>
          <CardDescription>
            Select metrics to include and enter values to calculate category and overall scores
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(allMetrics).map(([category, categoryMetrics]) => (
            <div key={category} className="space-y-4">
              <h3 className="font-semibold capitalize">{category}</h3>
              {Object.entries(categoryMetrics).map(([metric, details]) => (
                <MetricInput
                  key={metric}
                  category={category}
                  metric={metric}
                  details={details}
                  enabledMetrics={enabledMetrics}
                  handleMetricToggle={handleMetricToggle}
                  metrics={metrics}
                  handleInputChange={handleInputChange}
                />
              ))}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Brand Strategy Scores</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {Object.entries(scores).map(([category, score]) => {
              const { category: label, color } = getScoreCategory(score);
              return (
                <div key={category} className="flex items-center justify-between">
                  <span className="capitalize">{category}</span>
                  <div className="flex items-center gap-2">
                    <span className={color}>{score.toFixed(1)}</span>
                    <span className="text-sm text-gray-500">({label})</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={Object.entries(scores)
                .filter(([category]) => category !== 'overall')
                .map(([category, value]) => ({
                  name: category.charAt(0).toUpperCase() + category.slice(1),
                  value
                }))}>
                <PolarGrid />
                <PolarAngleAxis dataKey="name" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar
                  name="Brand Metrics"
                  dataKey="value"
                  stroke="#2563eb"
                  fill="#2563eb"
                  fillOpacity={0.6}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>History</CardTitle>
            <CardDescription>
              Previous brand evaluations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {history.map((entry) => (
              <Collapsible
                key={entry.id}
                open={expandedHistory === entry.id}
                onOpenChange={() => setExpandedHistory(expandedHistory === entry.id ? null : entry.id)}
              >
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <CollapsibleTrigger className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="font-medium">{entry.brandName}</span>
                          <span className="text-sm text-gray-500">
                            {formatDate(entry.date)}
                          </span>
                        </div>
                        {expandedHistory === entry.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </CollapsibleTrigger>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-2 text-gray-500 hover:text-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteEntry(entry);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <CollapsibleContent className="mt-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        {Object.entries(entry.scores)
                          .map(([category, score]) => {
                            const { category: label, color } = getScoreCategory(score);
                            return (
                              <div key={category} className="flex items-center justify-between">
                                <span className="capitalize">{category}</span>
                                <div className="flex items-center gap-2">
                                  <span className={color}>{score.toFixed(1)}</span>
                                  <span className="text-sm text-gray-500">({label})</span>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart data={Object.entries(entry.scores)
                            .filter(([category]) => category !== 'overall')
                            .map(([category, value]) => ({
                              name: category.charAt(0).toUpperCase() + category.slice(1),
                              value
                            }))}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="name" />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} />
                            <Radar
                              name="Brand Metrics"
                              dataKey="value"
                              stroke="#2563eb"
                              fill="#2563eb"
                              fillOpacity={0.6}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => loadHistoryEntry(entry)}
                      className="w-full"
                    >
                      Load These Results
                    </Button>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ))}
          </CardContent>
        </Card>
      )}
      
        <CardHeader>
          <CardTitle>© Faizan Rashid Bhat 2025</CardTitle>
        </CardHeader>
      
    </div>
    
    {/* Delete Confirmation Dialog */}
    <DeleteDialog
      isOpen={deleteDialogOpen}
      onClose={() => {
        setDeleteDialogOpen(false);
        setEntryToDelete(null);
        setDeleteConfirmationText('');
      }}
      onConfirm={confirmDelete}
      brandName={entryToDelete?.brandName || ''}
      confirmationText={deleteConfirmationText}
      setConfirmationText={setDeleteConfirmationText}
    />
    </>
  );
};

export default BrandStrategyCalculator;
