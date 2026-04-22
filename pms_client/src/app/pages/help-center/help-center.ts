import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  Search,
  BookOpen,
  Briefcase,
  ArrowRightLeft,
  Shield,
  BarChart3,
  CreditCard,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Mail,
  ExternalLink,
  Lightbulb,
  Rocket,
  Clock,
} from 'lucide-angular';

interface FaqItem {
  question: string;
  answer: string;
  open: boolean;
}

interface HelpCategory {
  icon: any;
  title: string;
  description: string;
  articles: string[];
  color: string;
  bgColor: string;
}

@Component({
  selector: 'app-help-center',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './help-center.html',
  styleUrl: './help-center.css',
})
export class HelpCenter {
  Search = Search;
  BookOpen = BookOpen;
  Briefcase = Briefcase;
  ArrowRightLeft = ArrowRightLeft;
  Shield = Shield;
  BarChart3 = BarChart3;
  CreditCard = CreditCard;
  ChevronDown = ChevronDown;
  ChevronUp = ChevronUp;
  MessageCircle = MessageCircle;
  Mail = Mail;
  ExternalLink = ExternalLink;
  Lightbulb = Lightbulb;
  Rocket = Rocket;
  Clock = Clock;

  searchQuery = '';

  categories: HelpCategory[] = [
    {
      icon: this.Rocket,
      title: 'Getting Started',
      description: 'New to Moonland? Start here to learn the basics and set up your first portfolio.',
      articles: ['Creating your account', 'Platform overview', 'Setting up your first portfolio', 'Adding funds to your account'],
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      icon: this.Briefcase,
      title: 'Portfolio Management',
      description: 'Learn how to create, organize, and optimize your investment portfolios.',
      articles: ['Creating a new portfolio', 'Understanding portfolio metrics', 'Rebalancing strategies', 'Portfolio performance tracking'],
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: this.ArrowRightLeft,
      title: 'Trading',
      description: 'Everything about executing trades, order types, and transaction history.',
      articles: ['Placing a buy order', 'Placing a sell order', 'Understanding order types', 'Viewing transaction history'],
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      icon: this.Shield,
      title: 'Account & Security',
      description: 'Manage your profile, security settings, and account preferences.',
      articles: ['Updating your profile', 'Changing your password', 'Two-factor authentication', 'Session management'],
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
    },
    {
      icon: this.BarChart3,
      title: 'Market Data',
      description: 'Understand market overviews, watchlists, and real-time stock data.',
      articles: ['Reading market charts', 'Setting up your watchlist', 'Understanding stock indicators', 'Real-time price updates'],
      color: 'text-violet-600',
      bgColor: 'bg-violet-50',
    },
    {
      icon: this.CreditCard,
      title: 'Funds & Billing',
      description: 'Manage deposits, withdrawals, and understand your account balance.',
      articles: ['Adding funds', 'Withdrawal process', 'Understanding fees', 'Transaction receipts'],
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
    },
  ];

  faqs: FaqItem[] = [
    {
      question: 'How do I create my first portfolio?',
      answer: 'Navigate to the Portfolio section from the sidebar, then click "Create Portfolio." Give your portfolio a name and an optional description, and you\'re ready to start adding holdings through the trading interface.',
      open: false,
    },
    {
      question: 'What order types are supported?',
      answer: 'Currently, Moonland supports market orders for both buying and selling. Market orders execute immediately at the current market price. We\'re actively working on adding limit orders and stop-loss orders in future updates.',
      open: false,
    },
    {
      question: 'How do I add funds to my account?',
      answer: 'Click the "Add Funds" button on your dashboard or navigate to your account settings. Enter the amount you\'d like to deposit and confirm. Funds are credited to your balance instantly and can be used for trading right away.',
      open: false,
    },
    {
      question: 'Can I track multiple portfolios?',
      answer: 'Yes! Moonland allows you to create and manage multiple portfolios simultaneously. Each portfolio has its own dashboard with dedicated performance metrics, holdings, and transaction history.',
      open: false,
    },
    {
      question: 'How is my portfolio performance calculated?',
      answer: 'Portfolio performance is calculated based on the total value of your holdings compared to your initial investment. We track both realized gains (from completed trades) and unrealized gains (from current holdings) to give you a complete picture.',
      open: false,
    },
    {
      question: 'What data sources are used for stock prices?',
      answer: 'Moonland aggregates market data from leading financial data providers to ensure accuracy and timeliness. Stock prices are updated in real-time during market hours via WebSocket connections.',
      open: false,
    },
  ];

  toggleFaq(index: number) {
    this.faqs[index].open = !this.faqs[index].open;
  }
}
